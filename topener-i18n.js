ko.i18n = ko.i18n || {};

// If Local Storage is not enabled, use this js object.
// IE7                            -> Local Storage is not implemented
// IE8- & local html              -> Local Storage is disabled
// IE8- & remote html             -> enabled
// Chrome, Firefox, Safari, Opera -> enabled
ko.i18n.dic = {};

ko.i18n.lang = ko.observable('');
ko.i18n.lang(
  (
    (localStorage && localStorage.getItem('i18n.lang')) ||
    (window.navigator.languages && window.navigator.languages[0]) ||
    window.navigator.language ||
    window.navigator.userLanguage ||
    window.navigator.browserLanguage
  ).substr(0,2)
);
ko.i18n.lang.subscribe(function(newValue) {
  if (localStorage) {
    localStorage.setItem('i18n.lang', newValue);
  } else {
    console && console.log('[warn] Local Storage is not enabled!!');
    ko.i18n.dic['i18n.lang'] = newValue;
  }
});

ko.i18n.register = function(lang, version, dictionary) {

  if (localStorage) {
    var localVersion = localStorage.getItem('i18n.' + lang + '.version');
    if (!localVersion || localVersion < version) {
      localStorage.setItem('i18n.' + lang + '.version', version);
      for (key in dictionary) {
        localStorage.setItem('i18n.' + lang + '.' + key, dictionary[key]);
      }
    }
  } else {
    ko.i18n.dic['i18n.' + lang + '.version'] = version;
    for (key in dictionary) {
      ko.i18n.dic['i18n.' + lang + '.' + key] = dictionary[key];
    }
  }
}

ko.i18n.version = function(lang) {
  if (localStorage) {
    var localVersion = localStorage.getItem('i18n.' + lang + '.version');
    return localVersion ? localVersion : 0.0;
  } else {
    return 0.0;
  }
}

ko.bindingHandlers.i18n = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    return { 'controlsDescendantBindings': true };
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var lang = ko.i18n.lang();
    if ((localStorage && !localStorage.getItem('i18n.' + lang + '.version')) && !ko.i18n.dic['i18n.' + lang + '.version']) {
      lang = 'en';
    }

    var value = valueAccessor();
    var idx = value;
    var vars = {};
    if ((typeof value) === 'object') {
      idx = Object.keys(value)[0];
      vars = value[idx];
    }

    var message = localStorage
      ? localStorage.getItem('i18n.' + lang + '.' + idx)
      : ko.i18n.dic['i18n.' + lang + '.' + idx];

    if (message) {
      for (key in vars){
        message = message.replace('%'+key+'%', vars[key]);
      }
    } else {
      console && console.log('[warn] Message key \"' + idx + '\" is not exist in the \"' + lang + '\" dictionary.');
    }

    ko.utils.setTextContent(element, message);
  }
};
ko.virtualElements.allowedBindings['i18n'] = true;
