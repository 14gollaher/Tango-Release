import os
import json
from TangoUserApplication import *


class TangoRepository:

    def __init__(self):
        self.directory = os.path.dirname(__file__) 
        self.filePath = os.path.join(self.directory, 'tango-pages.json')

    def upsert_tango_pages(self, new_tango_pages):
        with open(self.filePath, 'w') as filePath:
            json.dump(new_tango_pages, filePath)

    def upsert_tango_page(self, new_tango_page):
        tango_pages = self.get_tango_pages()

        page_exists = False
        for i in range(len(tango_pages)):
            if tango_pages[i]['view_name'] == new_tango_page['view_name']:
                tango_pages[i] = new_tango_page
                page_exists = True

        if not page_exists: tango_pages.append(new_tango_page)

        self.upsert_tango_pages(tango_pages)

    def get_tango_pages(self):
        with open(self.filePath, 'r') as filePath:
            return json.load(filePath)

    def get_tango_page(self, view_name):
        for tango_page in self.get_tango_pages():
            if tango_page['view_name'] == view_name: return tango_page
            
        tango_page = {}
        tango_page['view_name'] = view_name
        tango_page['cases'] = []
        tangoUserApplication = TangoUserApplication()
        tango_page['fields'] = tangoUserApplication.get_fields(view_name)

        return tango_page
        
    def update_field_selector(self, view_name, field_name, new_selector):
        fields = self.get_tango_page(view_name)['fields']
        
        for field in fields:
            if field['name'] == field_name: field['selector'] = new_selector

        tango_page['fields'] = fields
        self.upsert_tango_page(tango_page)

        