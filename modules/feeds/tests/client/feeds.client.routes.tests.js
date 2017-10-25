(function () {
  'use strict';

  describe('Feeds Route Tests', function () {
    // Initialize global variables
    var $scope,
      FeedsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FeedsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FeedsService = _FeedsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('feeds');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/feeds');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          FeedsController,
          mockFeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('feeds.view');
          $templateCache.put('modules/feeds/client/views/view-feed.client.view.html', '');

          // create mock Feed
          mockFeed = new FeedsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Feed Name'
          });

          // Initialize Controller
          FeedsController = $controller('FeedsController as vm', {
            $scope: $scope,
            feedResolve: mockFeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:feedId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.feedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            feedId: 1
          })).toEqual('/feeds/1');
        }));

        it('should attach an Feed to the controller scope', function () {
          expect($scope.vm.feed._id).toBe(mockFeed._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/feeds/client/views/view-feed.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          FeedsController,
          mockFeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('feeds.create');
          $templateCache.put('modules/feeds/client/views/form-feed.client.view.html', '');

          // create mock Feed
          mockFeed = new FeedsService();

          // Initialize Controller
          FeedsController = $controller('FeedsController as vm', {
            $scope: $scope,
            feedResolve: mockFeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.feedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/feeds/create');
        }));

        it('should attach an Feed to the controller scope', function () {
          expect($scope.vm.feed._id).toBe(mockFeed._id);
          expect($scope.vm.feed._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/feeds/client/views/form-feed.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          FeedsController,
          mockFeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('feeds.edit');
          $templateCache.put('modules/feeds/client/views/form-feed.client.view.html', '');

          // create mock Feed
          mockFeed = new FeedsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Feed Name'
          });

          // Initialize Controller
          FeedsController = $controller('FeedsController as vm', {
            $scope: $scope,
            feedResolve: mockFeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:feedId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.feedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            feedId: 1
          })).toEqual('/feeds/1/edit');
        }));

        it('should attach an Feed to the controller scope', function () {
          expect($scope.vm.feed._id).toBe(mockFeed._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/feeds/client/views/form-feed.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
