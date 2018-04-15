class HappyPathForm(forms.Form):
    firstName = forms.CharField(label='First name', max_length=50)
    lastName = forms.CharField(label='Last name', max_length=50)
    emailAddress = forms.EmailField(label='E-Mail', max_length=100)
    age = forms.IntegerField(label='Age', min_value = 10, max_value=100)
