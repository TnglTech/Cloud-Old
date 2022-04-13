from django.contrib import admin
from .models import Device, Lamp, MoonLamp, Profile

# Register your models here.
admin.site.register(Profile)
admin.site.register(Device)
admin.site.register(Lamp)
admin.site.register(MoonLamp)
