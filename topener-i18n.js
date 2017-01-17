ko.i18n = ko.i18n || {};
ko.i18n.lang = ko.observable('en');
ko.i18n.register = function(lang, version, dictionary) {
  if (typeof(Storage) === 'undefined') {
      console.log('[warn] web storage is not supported');
      return;
  }

  var lstorage = localStorage;
  var localVersion = lstorage.getItem(lang + '.version');
  if (!localVersion || localVersion < version) {
    lstorage.setItem(lang + '.version', version);
    for (key in dictionary) {
      lstorage.setItem(lang + '.' + key, dictionary[key]);
    }
  }
}

ko.bindingHandlers.i18n = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    return { 'controlsDescendantBindings': true };
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var lang = ko.i18n.lang();
    if (!localStorage.getItem(lang + ".version")) {
      lang = 'en';
    }

    var value = valueAccessor();
    var idx = value;
    var vars = {};
    if ((typeof value) === 'object') {
      idx = Object.keys(value)[0];
      vars = value[idx];
    }

    var message = localStorage.getItem(lang + '.' + idx);
    for (key in vars){
        message = message.replace('%'+key+'%', vars[key]);
    }

    ko.utils.setTextContent(element, message);
  }
};
ko.virtualElements.allowedBindings['i18n'] = true;
