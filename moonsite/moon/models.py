from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from uuid import uuid4
from django.db.models.signals import post_save
from django.dispatch import receiver
from polymorphic.models import PolymorphicModel
import json
import paho.mqtt.publish

# Create your models here.
DEFAULT_USER = 'parked_device_user'


def get_parked_user():
    return get_user_model().objects.get_or_create(username=DEFAULT_USER)[0]


def generate_association_code():
    return uuid4().hex


def generate_device_association_topic(type, device_id):
    return 'devices/{}/{}/associated'.format(device_id, type)


def send_association_message(type, device_id, message):
    paho.mqtt.publish.single(
        generate_device_association_topic(type, device_id),
        json.dumps(message),
        qos=2,
        retain=True,
        hostname="localhost",
        port=50001,
    )


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=12, blank=True)


class Device(PolymorphicModel):
    name = models.CharField(max_length=50, default="My MoonLamp")
    device_id = models.CharField(max_length=12, primary_key=True)
    user = models.ForeignKey(User,
                             on_delete=models.SET(get_parked_user))
    association_code = models.CharField(max_length=32, unique=True,
                                        default=generate_association_code)
    created_at = models.DateTimeField(auto_now_add=True)

    def dissociate(self):
        self.user = get_parked_user()
        self.association_code = generate_association_code()
        self.save()
        self.publish_unassociated_msg()

    def publish_unassociated_msg(self):
        # send association MQTT message
        assoc_msg = {
            'associated': False,
            'code': self.association_code
        }
        send_association_message(self.type, self.device_id, assoc_msg)

    def associate_and_publish_associated_msg(self, user):
        # update Device instance with new user
        self.user = user
        self.save()
        # publish associated message
        assoc_msg = {
            'associated': True
        }
        send_association_message(self.type, self.device_id, assoc_msg)

    def __str__(self):
        return "{}: {}".format(self.device_id, self.name)

    def to_dict(self):
        dct = {
            'name': self.name,
            'device_id': self.device_id
        }
        return dct


class Lamp(Device):
    type = "lamp"


class MoonLamp(Lamp):
    type = "moonlamp"






