from django.shortcuts import render
from TangoComponents.TangoRepository import *
from TangoComponents.TangoUserApplication import *
from TangoComponents.TangoPermutationGenerator import *
from django.http import JsonResponse, HttpResponse
import json
import ast
from django.core.serializers.json import DjangoJSONEncoder

def view_test(request, test_view_name):
    tango_repository = TangoRepository()
    if not test_view_name: test_view_name = 'index'

    return render(
        request,
        'tango/view_test.html',
        {
            'tango_page': json.dumps(tango_repository.get_tango_page(test_view_name), cls = DjangoJSONEncoder)
        }
    )

def view_select(request):
    tangoUserApplication = TangoUserApplication()
    return render(
        request,
        'tango/view-select.html',
        {
            'views': json.dumps(list(tangoUserApplication.views), cls = DjangoJSONEncoder)
        }
    )

def save_tango_page(request):
    tango_repository = TangoRepository()
    tango_repository.upsert_tango_page(ast.literal_eval(request.GET['tangoPage']))
    return HttpResponse('')

def get_tango_page(request):
    tango_repository = TangoRepository()
    tango_page = tango_repository.get_tango_page(request.GET['viewName'])

    if tango_page: return JsonResponse(tango_page,  safe = False)

    return JsonResponse([], safe = False)

def generate_permutations(request):
    tango_permutation_generator = TangoPermutationGenerator()
    return JsonResponse(tango_permutation_generator.generate_permutations(request.GET['viewName']), safe = False)