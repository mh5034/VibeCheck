"""Run: backend/venv/Scripts/python.exe -m unittest discover -s backend/tests"""
import os
from pathlib import Path
import sys
import unittest
from datetime import datetime
from unittest.mock import patch

# Never connect to the configured application database during these tests.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["GROQ_API_KEY"] = "test-key"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import HTTPException
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
import models
import schemas
from routers.topics import get_topics, get_topic_posts, create_post, delete_post
from routers.users import get_dashboard


class TopicQueryTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        models.Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        user = models.User(email="test@example.com", password="unused")
        self.db.add(user)
        self.db.flush()
        self.user_id = user.id
        for number in range(12):
            topic = models.Topic(name=f"Topic {number}")
            self.db.add(topic)
            self.db.flush()
            for post_number in range(number):
                self.db.add(models.Post(
                    content=f"Post {post_number}", topic_id=topic.id,
                    user_id=user.id, sentiment_score=0,
                    created_at=datetime(2026, 1, 1),
                ))
        self.db.commit()
        self.db.expunge_all()
        self.queries = []
        event.listen(self.engine, "before_cursor_execute", self.record_query)

    def record_query(self, conn, cursor, statement, parameters, context, executemany):
        if statement.lstrip().upper().startswith("SELECT"):
            self.queries.append(statement)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_topics_count_posts_in_one_query_including_empty_topics(self):
        result = get_topics(self.db)
        self.assertEqual(len(self.queries), 1)
        self.assertEqual([topic.post_count for topic in result], list(reversed(range(12))))
        self.assertFalse(any(isinstance(obj, models.Post) for obj in self.db.identity_map.values()))

    def test_dashboard_query_count_does_not_grow_with_topics(self):
        user = self.db.get(models.User, self.user_id)
        self.queries.clear()
        result = get_dashboard(self.db, user)
        self.assertEqual(len(self.queries), 2)
        self.assertEqual(result.total_posts, 66)
        self.assertEqual(result.avg_sentiment, 0)
        self.assertEqual(len({post.topic_name for post in result.posts}), 11)
        for post in result.posts:
            self.assertEqual(self.db.get(models.Topic, post.topic_id).name, post.topic_name)

    def test_topic_posts_are_bounded_and_ordered_when_timestamps_tie(self):
        topic = models.Topic(name="Busy")
        self.db.add(topic)
        self.db.flush()
        topic_id = topic.id
        posts = [models.Post(content=str(i), topic_id=topic_id,
                             user_id=self.user_id, created_at=datetime(2026, 1, 1))
                 for i in range(25)]
        self.db.add_all(posts)
        self.db.flush()
        expected_ids = sorted((post.id for post in posts), reverse=True)[:20]
        self.db.commit()
        self.db.expunge_all()
        self.queries.clear()
        result = get_topic_posts(topic_id, self.db)
        self.assertEqual([post.id for post in result.posts], expected_ids)
        self.assertEqual(len(self.queries), 2)

    def test_missing_topic_raises_404(self):
        with self.assertRaises(HTTPException) as caught:
            get_topic_posts(9999, self.db)
        self.assertEqual(caught.exception.status_code, 404)


    def test_create_and_delete_use_post_scores_even_when_summary_fails(self):
        user = self.db.get(models.User, self.user_id)
        topic = models.Topic(name="Scoring")
        self.db.add(topic)
        self.db.flush()
        self.db.add(models.Post(content="Bad", sentiment_score=20,
                                topic_id=topic.id, user_id=user.id))
        self.db.commit()
        with patch("routers.topics.get_sentiment", return_value=90), patch(
            "routers.topics.get_topic_summary", return_value={"summary": None}
        ):
            post = create_post(topic.id, schemas.PostCreate(content="Love it"), self.db, user)
            self.assertEqual(float(topic.ai_vibe_score), 55)
            delete_post(post.id, self.db, user)
            self.assertEqual(float(topic.ai_vibe_score), 20)
            last = self.db.query(models.Post).filter_by(topic_id=topic.id).one()
            delete_post(last.id, self.db, user)
            self.assertIsNone(topic.ai_vibe_score)
            self.assertIsNone(topic.ai_summary)

    def test_topic_average_only_uses_latest_twenty_posts(self):
        user = self.db.get(models.User, self.user_id)
        topic = models.Topic(name="Recent scoring")
        self.db.add(topic)
        self.db.flush()
        for i in range(21):
            self.db.add(models.Post(content="Older", sentiment_score=0 if i == 0 else 80,
                                    topic_id=topic.id, user_id=user.id,
                                    created_at=datetime(2026, 1, 1)))
        self.db.commit()
        with patch("routers.topics.get_sentiment", return_value=None), patch(
            "routers.topics.get_topic_summary", return_value={"summary": None}
        ) as summary:
            create_post(topic.id, schemas.PostCreate(content="New"), self.db, user)
            self.assertEqual(float(topic.ai_vibe_score), 80)
            self.assertEqual(len(summary.call_args.args[0]), 20)


if __name__ == "__main__":
    unittest.main()
