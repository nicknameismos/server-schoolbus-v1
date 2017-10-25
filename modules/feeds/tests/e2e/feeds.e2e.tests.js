'use strict';

describe('Feeds E2E Tests:', function () {
  describe('Test Feeds page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/feeds');
      expect(element.all(by.repeater('feed in feeds')).count()).toEqual(0);
    });
  });
});
