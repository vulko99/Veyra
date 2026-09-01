from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lenders", "0007_lender_is_demo"),
    ]

    operations = [
        migrations.AddField(
            model_name="lenderproduct",
            name="ad_eligible",
            field=models.BooleanField(
                default=True,
                help_text=(
                    "May be featured on paid-traffic landing pages. Set False for "
                    "products repayable in 60 days or less (Google Ads policy). Does "
                    "not affect matching."
                ),
            ),
        ),
    ]
