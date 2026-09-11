import pytest
from ml.src.feed_classifier import FeedSilageClassifier

def test_feed_classifier_good_sample():
    classifier = FeedSilageClassifier()
    res = classifier.analyze_sample(
        feed_type="Corn Silage",
        moisture_level="Optimal (60-70%)",
        smell_rating="Pleasant Fruity / Acidic",
        color_obs="Olive Green / Golden Yellow",
        mold_visible=False
    )
    assert res["category"] == "GOOD"
    assert res["quality_score"] >= 75.0
    assert res["probabilities"]["GOOD"] > 0.5
    assert res["alert_required"] is False

def test_feed_classifier_poor_sample():
    classifier = FeedSilageClassifier()
    res = classifier.analyze_sample(
        feed_type="Corn Silage",
        moisture_level="Too Wet / Soggy",
        smell_rating="Foul / Putrid / Rancid",
        color_obs="Black / Dark Brown Mold",
        mold_visible=True
    )
    assert res["category"] == "POOR"
    assert res["quality_score"] < 50.0
    assert res["probabilities"]["POOR"] > 0.5
    assert res["alert_required"] is True
