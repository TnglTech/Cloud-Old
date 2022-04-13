from django.views import generic
from django import forms
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import FormMixin
from django.http import HttpResponseForbidden, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Device, Lamp, MoonLamp
from tngl.forms import *
import json


def user_has_device(user, device_id):
    if Device.objects.filter(user=user, pk=device_id):
        return True
    return False


class IndexView(LoginRequiredMixin, generic.ListView):
    template_name = 'tngl/index.html'
    context_object_name = 'devices'

    def get_queryset(self):
        results = {
            'moonlamps': MoonLamp.objects.filter(user=self.request.user)
        }
        return results


class LampDetailView(LoginRequiredMixin, FormMixin, generic.TemplateView):
    template_name = 'tngl/lampdetail.html'
    form_class = DeviceNameForm
    base_url = '/tngl/device/lamp/'
    success_url = '/tngl/device/lamp/'

    def get_context_data(self, **kwargs):
        context = super(LampDetailView, self).get_context_data(**kwargs)
        context['device'] = get_object_or_404(
            Lamp, pk=kwargs['device_id'], user=self.request.user)
        print("CONTEXT: {}".format(context))
        return context

    def post(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and user_has_device(request.user, kwargs['device_id'])):
            return HttpResponseForbidden()
        form = self.get_form()
        self.success_url = self.base_url + kwargs['device_id']
        if form.is_valid():
            return self.form_valid(form, **kwargs)
        else:
            return self.form_invalid(form)

    def form_valid(self, form, **kwargs):
        name = form.cleaned_data['name']
        lamp = Lamp.objects.get(pk=kwargs['device_id'], user=self.request.user)
        lamp.name = name
        lamp.save()
        return super().form_valid(form)


class MoonLampDetailView(LampDetailView):
    pass


class AddDeviceView(LoginRequiredMixin, generic.FormView):
    template_name = 'tngl/add_device.html'
    form_class = AddDeviceForm
    success_url = '/tngl'

    def form_valid(self, form):
        device = form.cleaned_data['device']
        device.associate_and_publish_associated_msg(self.request.user)
        device.name = self.request.POST['name']
        device.save()
        return super(AddDeviceView, self).form_valid(form)


@api_view(['POST'])
def dissociate_device(request):
    if not request.user.is_authenticated:
        return HttpResponseForbidden()

    data = request.POST
    if 'device_id' not in data:
        return HttpResponse("{}", status=status.HTTP_400_BAD_REQUEST)

    lampi = None
    doorbell = None
    try:
        doorbell = Doorbell.objects.get(pk=data['device_id'])
        if not user_has_device(request.user, doorbell.device_id):
            return HttpResponseForbidden()
        doorbell.dissociate()
    except Doorbell.DoesNotExist:
        doorbell = None

    try:
        lampi = Lampi.objects.get(pk=data['device_id'])
        if not user_has_device(request.user, lampi.device_id):
            return HttpResponseForbidden()
        lampi.dissociate()
    except Lampi.DoesNotExist:
        lampi = None

    if doorbell is not None or lampi is not None:
        return HttpResponse("{}", status=status.HTTP_200_OK)
    else:
        return HttpResponse("{}", status=status.HTTP_400_BAD_REQUEST)