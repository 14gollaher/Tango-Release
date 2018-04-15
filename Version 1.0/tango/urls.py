from django.conf.urls import include, url

import tango.views

urlpatterns = [
    url(r'^generate-permutations', tango.views.generate_permutations, name = "generate_permutations"),
    url(r'^save-tango-page', tango.views.save_tango_page, name = "save_tango_page"),
    url(r'^get-tango-page', tango.views.get_tango_page, name = "get_tango_page"),
    url(r'^$', tango.views.view_select, name = "view_select"),
    url(r'^(?P<test_view_name>\'?\w+([-]\w+)*\'?)$', tango.views.view_test, name = "view_test")
]
