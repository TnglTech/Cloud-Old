from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import MoonLamp, Lamp


def device_association_topic(device_id):
    return 'devices/{}/lamp/associated'.format(device_id)


class DeviceNameForm(forms.Form):
    name = forms.CharField()

    def clean(self):
        cleaned_data = super(DeviceNameForm, self).clean()
        return cleaned_data


class AddDeviceForm(forms.Form):
    name = forms.CharField(label="Name", min_length=2, max_length=30)
    association_code = forms.CharField(label="Association Code", min_length=6,
                                       max_length=6)

    def clean(self):
        cleaned_data = super(AddDeviceForm, self).clean()
        print("received form with code {}".format(
              cleaned_data['association_code']))
        # look up device with start of association_code
        uname = settings.DEFAULT_USER
        parked_user = get_user_model().objects.get(username=uname)
        moonlamp_devices = MoonLamp.objects.filter(
            user=parked_user,
            association_code__startswith=cleaned_data['association_code'])

        if moonlamp_devices:
            cleaned_data['device'] = moonlamp_devices[0]
        else:
            self.add_error('association_code',
                           ValidationError("Invalid Association Code",
                                           code='invalid'))
        return cleaned_data
