(function () {
    var unwrap = ko.utils.unwrapObservable;

    ko.observableArray.fn.subscribeArrayChanged = function (addCallback, deleteCallback, refreshCallback) {
        var previousValue = undefined;
        this.subscribe(function (_previousValue) {
            previousValue = _previousValue.slice(0);
        }, undefined, 'beforeChange');
        this.subscribe(function (latestValue) {
            var editScript = ko.utils.compareArrays(previousValue, latestValue);
            for (var i = 0, j = editScript.length; i < j; i++) {
                switch (editScript[i].status) {
                    case "retained":
                        if (refreshCallback)
                            refreshCallback(editScript[i].value);
                        break;
                    case "deleted":
                        if (deleteCallback)
                            deleteCallback(editScript[i].value);
                        break;
                    case "added":
                        if (addCallback)
                            addCallback(editScript[i].value);
                        break;
                }
            }
            previousValue = undefined;
        });
    };


    ko.bindingHandlers.tokenInput = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var el = $(element)
            , settings = valueAccessor()
            , allBindings = allBindingsAccessor()
            , search = settings.search
            , values = settings.values
            , theme = settings.theme || "facebook"
            , addHandler = function (item) { el.tokenInput("add", item, false); }
            , removeHandler = function (item) { el.tokenInput("remove", item, false); }

            // init and subscribe to ui changes into observable
            el.tokenInput( [] , {
                theme: theme
                , preventDuplicates: true
                , enableCache: false
                , disableCallbacks:false
                , onResult: function (results, query) {
                    return search.call(viewModel, viewModel, query);
                }
                , onAdd: function (item) {
                    values.push(item)                    
                }
                , onDelete: function (item) {
                    values.remove(item)                    
                }
            })

            values.subscribeArrayChanged(addHandler, removeHandler);
        },
    }

})();