Unprotect[Plot]
Options[Plot] = Flatten[{Options[Plot], Controls->False}]

Unprotect[Graphics]
Options[Graphics] = Flatten[{Options[Graphics], Controls->False}]

RegisterWebObject[Graphics];