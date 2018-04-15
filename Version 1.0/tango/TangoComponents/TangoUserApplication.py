from django.apps import apps
import inspect
from django.conf import settings
from django.core.urlresolvers import RegexURLResolver, RegexURLPattern
import django
from app import views
import app
import os
import json

class TangoUserApplication:
    def __init__(self):
        self.populate_models()
        self.populate_forms()
        self.populate_views()

    def get_fields(self, view_name):
        for view in self.views:
            if view['name'] == view_name:
                test_view = view
                break
        
        fields = []
        for component in test_view['components']:
            for form in self.forms:
                if form['name'] == component['name']:
                    for property in form['properties']:
                        fields.append({'name': property['name'], 'selector': "#id_" + property['name']})
            for model in self.models:
                pass # TODO

        return fields

    def populate_views(self):
        self.views = []
        file_path = os.path.join(os.path.dirname(__file__)) + '\\tango-configuration.json'
        
        with open(file_path) as data_file:    
            settings = json.load(data_file)

        for view, view_value in settings['views-to-test'].iteritems():
            new_view = {}
            new_view['name'] = view
            new_view['components'] = []

            for view_or_model in view_value:
                view_component = {}
                view_component['name'] = view_or_model

                new_view['components'].append(view_component)
            self.views.append(new_view)

    def populate_models(self):
        self.models = [];
        models = apps.get_app_config('app').get_models();

        for model in models:
            eachmodel = [];
            eachmodel.append(model.__name__)
            fields = model._meta.get_fields()

            for field in fields:
              if not field.is_relation or field.one_to_one or (field.many_to_one and field.related_model):
                  model_property = {}
                  model_property['name'] = field.get_internal_type()
                  model_property['type'] = field.name
                  if hasattr(field, 'input_formats'): 
                    model_property['input_formats'] = field.input_formats
                  if hasattr(field, 'max_length'): 
                    model_property['max_length'] = field.max_length
                  if hasattr(field, 'max_digits'): 
                    model_property['max_digits'] = field.max_digits
                  if hasattr(field, 'min_length'):
                    model_property['min_length'] = field.min_length
                  if hasattr(field, 'max_value'): 
                    model_property['max_value'] = field.max_value
                  if hasattr(field, 'min_value'): 
                    model_property['min_value'] = field.min_value
                  if hasattr(field, 'unpack_ipv4'): 
                    model_property['unpack_ipv4'] = field.unpack_ipv4


                  eachmodel.append(model_property)
            self.models.append(eachmodel)

    def populate_forms(self):
        self.forms = []

        all_django_forms = self.get_subclasses(django.forms.Form) 

        for i in range(6, len(all_django_forms) - 1): 
            django_form = all_django_forms[i];
            form = {}
            form['name'] = django_form.__name__
            form['properties'] = []

            for row in django_form.base_fields.viewitems():
                form_property = {}
                form_property['name'] = row[0]
                form_property['selector'] = "#id_" + form_property['name']
                form_property['type'] = self.get_type((row[1]))
                form_property['initial'] = row[1].initial
                form_property['required'] = row[1].required
                if hasattr(row[1], 'input_formats'): 
                    form_property['input_formats'] = row[1].input_formats
                if hasattr(row[1], 'max_length'): 
                    form_property['max_length'] = row[1].max_length
                if hasattr(row[1], 'max_digits'): 
                    form_property['max_digits'] = row[1].max_digits
                if hasattr(row[1], 'min_length') and row[1].min_length: 
                    form_property['min_length'] = row[1].min_length
                if hasattr(row[1], 'max_value'): 
                    form_property['max_value'] = row[1].max_value
                if hasattr(row[1], 'min_value'): 
                    form_property['min_value'] = row[1].min_value
                if hasattr(row[1], 'decimal_places'): 
                    form_property['decimal_places'] = row[1].decimal_places
                if hasattr(row[1], 'unpack_ipv4'): 
                    form_property['unpack_ipv4'] = row[1].unpack_ipv4
                if hasattr(row[1], 'min_length') and row[1].max_length: 
                    form_property['min_length'] = row[1].max_length

                form['properties'].append(form_property)
            self.forms.append(form)

    def get_type(self, djangoType):
        if type(djangoType) == django.forms.fields.CharField: return TangoType.string
        if type(djangoType) == django.forms.fields.EmailField: return TangoType.email
        if type(djangoType) == django.forms.fields.IntegerField: return TangoType.integer
        if type(djangoType) == django.forms.fields.DateField: return TangoType.date
        if type(djangoType) == django.forms.fields.DateTimeField: return TangoType.date_time
        if type(djangoType) == django.forms.fields.FloatField: return TangoType.float
        if type(djangoType) == django.forms.fields.DecimalField: return TangoType.decimal
        if type(djangoType) == django.forms.fields.BooleanField: return TangoType.boolean
        if type(djangoType) == django.forms.fields.GenericIPAddressField: return TangoType.ipAddress
        if type(djangoType) == django.forms.fields.TimeField: return TangoType.time
        if type(djangoType) == django.forms.fields.URLField: return TangoType.url


    def get_subclasses(self, cls): 
        return cls.__subclasses__() + [g for s in cls.__subclasses__() 
                                   for g in self.get_subclasses(s)] 

    def get_all_subclasses(self, parent_class):
        all_subclasses = []

        for subclass in parent_class.__subclasses__():
            all_subclasses.append(subclass)
            all_subclasses.extend(get_all_subclasses(subclass))

        return all_subclasses

class TangoType:
    string = 1
    email = 2
    integer = 3
    date_time = 4
    date = 5
    decimal = 6
    float = 7
    boolean = 8
    ipAddress = 9
    decimal = 10
    time = 11
    url = 12

