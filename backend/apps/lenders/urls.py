from rest_framework.routers import DefaultRouter

from .views import EligibilityRuleViewSet, LenderProductViewSet, LenderViewSet

router = DefaultRouter()
router.register("lenders", LenderViewSet, basename="lender")
router.register("lender-products", LenderProductViewSet, basename="lender-product")
router.register("eligibility-rules", EligibilityRuleViewSet, basename="eligibility-rule")

urlpatterns = router.urls
