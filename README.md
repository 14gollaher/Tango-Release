#### What is Tango?
>Tango is a bolt-on Django application that facilitates organized and rapid user interface testing of Django projects. Tango provides administrators and developers a solution to automate testing of a Django web application. The system infers basic information about data types and expected validations from the standard Django form definitions to generate test cases for specified views or pages in a user’s application. Test cases are then ran by the user, and the user can indicate if the resulting page validation rules are correct. Tango is an easy-to-use application and requires minimal setup to begin using in any Django web application.
  
  
#### Setting up Tango
> 1. Clone or Download Tango (https://github.com/14gollaher/Tango-Release)
> 1. Copy the "tango" folder into existing Django web application folder structure. Tango is a stand-alone application that should be placed alongside your existing Django apps. 
>
>        Example Folder Structure:
>         | myApp
>         | env
>         | MyProject
>         | static
>         | tango # Do this!
>         | manage.py
>         | requirements.py
>         | ...
> 1. Add 'tango' to the INSTALLED_APPS list in settings.py of your existing Django project.
>       ``` none
>       INSTALLED_APPS = [
>          'myApp',
>          'tango', # Do this!
>          'django.crontrib.admin',
>          ...
>       ]
>       ```
>
>       
> 1. Add 'tango' to the urlpatterns and import tango.view in urls.py of your existing Django project.
>       
>       import myApp.views
>       import tango.views # Do this!
>       ...
>       ``` none
>       urlpatterns = [
>          url(r'^tango/', include('tango.urls', namespace="tango")), # Do this, order is important!
>          url(r'^$', app.views.home, name='home'),
>          ...
>       ]
>       ```
>
> 1. Add desired test applications to Tango configuration file (tango/TangoComponents/TangoConfiguration.json).
>
>     ``` none
>       {
>           "apps_to_test": [ "myApp" ], 
>           ...
>       }
>    ```
>       
> 1. Add desired views to test and their form relationships to Tango configuration file.
> 
>      ``` none
>       {
>           ...
>           "views-to-test": { 
>              "my-favorite-view": [ "my-favorite-form" ]
>              "my-other-view": [ "my-favorite-form, my-other-form" ]
>           }
>       }
>       ```
> 1. Run your application, and navigate to the Tango home page at baseUrl/tango (example: http:<span></span>//localhost:58306/tango/)
>
> 1. Select view to be tested from the page, and you're ready to begin using Tango!


What Fields are Tested?

> #### CharField 
>> ``` none
>> Example: CharField(max_length=11, min_length=2)
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | Hello |
>> | Blank | |
>> | SQL | Hello OR 1=1 |
>> | Maximum Length | Hello World |
>> | Maximum Length + 1 | Hello Worlds |
>> | Minimum Length | He |
>> | Minimum Length - 1 | H |

> #### EmailField 
>> ``` none
>> Example: EmailField()
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | email<span></span>@gmail.com |
>> | Blank | |
>> | SQL | email<span></span>@gmail.com OR 1=1 |
>> | Company | mcdonald<span></span>@green-jones.com |
>> | Ending Only | gmail.com |

> #### IntegerField
>> ``` none
>> Example: IntegerField(min_value = 10, max_value = 100)
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | 90 |
>> | Blank | |
>> | SQL | 45 OR 1=1 |
>> | Minimum Value | 10 |
>> | Minimum Value - 1 | 9 |
>> | Maximum Value | 100 |
>> | Maximum Value | 101 |

> #### DecimalField
>> ``` none
>> Example: DecimalField(max_value = 4224.2, min_value = 45, max_digits = 23, decimal_places = 2)
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | 75.21 |
>> | Blank | |
>> | Zero | 0 |
>> | Minimum Value | 45 | 
>> | Minimum Value - 42.21 | 2.79 |
>> | Maximum Value | 4224.2 |
>> | Maximum Value + 12.42 | 4236.62 |
>> | Decmial Places Length | 200.99 |
>> | Decimal Places Length + 1 | 200.997 |

> #### FloatField
>> ``` none
>> Example: FloatField(max_value = 4224.2, min_value = 45, max_digits = 23, decimal_places = 2)
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | 75.21 |
>> | Blank | |
>> | Zero | 0 |
>> | Minimum Value | 45 | 
>> | Minimum Value - 42.21 | 2.79 |
>> | Maximum Value | 4224.2 |
>> | Maximum Value + 12.42 | 4236.62 |
>> | Decmial Places Length | 200.99 |
>> | Decimal Places Length + 1 | 200.997 |

> #### TimeField
>> ``` none
>> Example: TimeField(input_formats='%H:%M:%S')
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | 12:30:22 |
>> | Blank | |
>> | InvalidFormat | 30:30:30 |

> #### URLField
>> ``` none
>> Example: URLField()
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | http://<span></span>google.com |
>> | Blank | |
>> | Email | email<span></span>@gmail.com |

> #### GenericIPAddressField
>> ``` none
>> Example: GenericIPAddressField(protocol='ipv4')
>> ```
>> | Case | Example |
>> | --- | --- |
>> | Happy Path | http://<span></span>google.com |
>> | Blank | |
>> | Protocol IPv4 | 192.168.240.1 |
>> | Protocol IPv6 | 2001:4860:4860::8888 |
