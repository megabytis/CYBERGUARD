import os
import joblib
from typing import Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

MODEL_CACHE_PATH = os.path.join(os.path.dirname(__file__), "threat_model.joblib")

# Curated foundational corpus for cybersecurity threat classification
TRAINING_SAMPLES = [
    # Malicious samples (phishing, smishing, credential lures, anomalies)
    ("verify your account credentials immediately or your access will be suspended", 1),
    ("urgent: your bank account has been locked. click here to confirm identity", 1),
    ("http://login-apple-security-check.com/verify", 1),
    ("http://192.168.1.100/admin/login.php", 1),
    ("payment failed for your usps delivery. pay $1.99 redelivery fee at bit.ly/usps-pay", 1),
    ("failed password for invalid user admin from 192.168.1.55 port 4444", 1),
    ("your netflix membership is on hold. update payment details at netflix-billing-update.cc", 1),
    ("unauthorized transaction of $489.99 detected. call fraud team or click link", 1),
    ("wire transfer instructions attached. please execute before end of business day", 1),
    ("docusign signature required: confidential executive contract agreement", 1),
    ("security alert: multi-factor authentication code 491823 requested. do not share", 1),
    ("paypal: unauthorized login detected from russia. review activity now", 1),
    ("dns query excessive byte transfer to c2-server.evil.biz:1337", 1),
    ("authentication failed: 25 invalid password attempts in 10 seconds", 1),
    ("http://paypal-security-verification.com.ru/auth/login", 1),
    ("package delivery notice: unpaid customs duty pending", 1),
    ("final notice: your subscription will auto-renew for $599 unless cancelled", 1),
    ("irs tax refund notification: submit your ssn and routing number to claim", 1),
    ("critical alert: your microsoft 365 password expires in 2 hours", 1),
    ("sudo: 3 incorrect password attempts ; tty=pts/0 ; user=guest", 1),

    # Benign samples (standard corporate communications, safe URLs, normal activity)
    ("weekly team sync meeting notes and sprint planning agenda", 0),
    ("https://github.com/google/guava/releases", 0),
    ("please review the pull request for the database migration feature", 0),
    ("accepted publickey for deployer from 10.0.0.15 port 22 ssh2", 0),
    ("https://docs.python.org/3/library/urllib.parse.html", 0),
    ("the lunch and learn session on kubernetes will start at 1pm in conference room b", 0),
    ("quarterly financial report presentation slides attached for your review", 0),
    ("welcome to our developer community newsletter! check out this month's updates", 0),
    ("https://en.wikipedia.org/wiki/Computer_security", 0),
    ("git commit -m 'refactor authentication middleware and improve test coverage'", 0),
    ("system update completed successfully. 0 errors, all services operational", 0),
    ("hi team, here is the updated design mockup for the customer dashboard", 0),
    ("scheduled maintenance window reminder: sunday 02:00 to 04:00 utc", 0),
    ("invoice #4091 for office supplies has been approved by accounting", 0),
    ("https://aws.amazon.com/security/introduction/", 0),
    ("connection established to internal ldap server on port 636 with valid tls", 0),
    ("thank you for attending yesterday's architecture review. notes are on confluence", 0),
    ("reminder: submit your timecard before friday 5pm", 0),
    ("new blog post: best practices for secure software development lifecycle", 0),
    ("https://stackoverflow.com/questions/tagged/python", 0),
]

class ThreatClassifier:
    """TF-IDF and Logistic Regression threat classification model running 100% locally."""

    _instance = None
    _pipeline = None

    @classmethod
    def get_instance(cls) -> "ThreatClassifier":
        if cls._instance is None:
            cls._instance = ThreatClassifier()
            cls._instance._load_or_train()
        return cls._instance

    def _load_or_train(self):
        """Loads cached model or trains a new pipeline in memory."""
        if os.path.exists(MODEL_CACHE_PATH):
            try:
                self._pipeline = joblib.load(MODEL_CACHE_PATH)
                return
            except Exception:
                pass

        # Train robust TF-IDF + Logistic Regression
        texts = [sample[0] for sample in TRAINING_SAMPLES]
        labels = [sample[1] for sample in TRAINING_SAMPLES]

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=2500,
                lowercase=True,
                stop_words="english",
            )),
            ("clf", LogisticRegression(
                C=1.5,
                solver="lbfgs",
                max_iter=500,
            )),
        ])

        pipeline.fit(texts, labels)
        self._pipeline = pipeline

        try:
            joblib.dump(pipeline, MODEL_CACHE_PATH)
        except Exception:
            pass

    def predict(self, text: str) -> Tuple[float, int]:
        """
        Infers malicious probability for given text.
        Returns: (probability_score_0_to_100, predicted_class_0_or_1)
        """
        if not self._pipeline or not text.strip():
            return 0.0, 0

        try:
            # Predict probability of class 1 (malicious)
            probs = self._pipeline.predict_proba([text])[0]
            malicious_prob = probs[1]
            score_100 = round(float(malicious_prob * 100), 1)
            pred_class = int(self._pipeline.predict([text])[0])
            return score_100, pred_class
        except Exception:
            return 0.0, 0
