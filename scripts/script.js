(function ($) {
  'use strict';

  $(function () {
    $(window).on('load resize', function () {
      $('.project-container').height($('.front img').height());
    });
  });

}(window.jQuery));