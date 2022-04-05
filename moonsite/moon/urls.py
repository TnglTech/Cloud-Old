from django.urls import path, re_path
from . import views

app_name = 'moon'

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('add/', views.AddDeviceView.as_view(), name='add'),
    # path('links/', views.LinkView.as_view(), name='links'),
    # path('links/update/', views.update_link_entry),
    # path('links/delete/', views.delete_link_entry),
    path('device/dissociate/', views.dissociate_device),
    re_path(r'^device/moonlamp/(?P<device_id>[0-9a-fA-F]+)$',
            views.MoonLampDetailView.as_view(), name='moonlampdetail'),
]