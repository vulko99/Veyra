from django.urls import path

from .views import MatchListView, MatchRunView

urlpatterns = [
    path("applications/<uuid:id>/match/", MatchRunView.as_view(), name="match-run"),
    path(
        "applications/<uuid:id>/matches/",
        MatchListView.as_view(),
        name="match-list",
    ),
]
