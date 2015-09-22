ng.module('smart-table')
  .directive('stSearch', ['stConfig', '$timeout','$parse', function (stConfig, $timeout, $parse) {
    return {
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {
        var tableCtrl = ctrl;
        var promise = null;
        var throttle = attr.stDelay || stConfig.search.delay;
        var event = attr.stInputEvent || stConfig.search.inputEvent;

        attr.$observe('stSearch', function (newValue, oldValue) {
          var input = element[0].value;
          if (newValue !== oldValue && input) {
            if(ng.isUndefined(ctrl.tableState().search)) {
              ctrl.tableState().search = {};
            }
            tableCtrl.search(input, newValue);
          }
        });

        //table state -> view
        scope.$watch(function () {
          return ctrl.tableState().search;
        }, function (newValue, oldValue) {
          var predicateExpression = attr.stSearch || '$';
          var value = $parse(predicateExpression)(newValue.predicateObject);
          if (newValue.predicateObject && value !== element[0].value) {
            if(ng.isUndefined(value) && value === null) {
              element[0].value = '';
            } else {
              element[0].value = $parse(predicateExpression)(newValue.predicateObject);
            }
          }
        }, true);

        // view -> table state
        element.bind(event, function (evt) {
          evt = evt.originalEvent || evt;
          if (promise !== null) {
            $timeout.cancel(promise);
          }

          promise = $timeout(function () {
            tableCtrl.search(evt.target.value, attr.stSearch || '');
            promise = null;
          }, throttle);
        });

        if(attr.ngModel) {
          scope.$watch(attr.ngModel, function(ngModel, old) {
            if (promise !== null) {
              $timeout.cancel(promise);
            }
            promise = $timeout(function() {
              tableCtrl.search(ngModel, attr.stSearch);
              promise = null;
            }, 0);
          });
        }
      }
    };
  }]);
