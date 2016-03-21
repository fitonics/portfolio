(function ($) {
  'use strict';

  var PAGE_URL = "http://en.wikipedia.org/?curid=",
    CALLBACK = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&format=json&exsentences=2&exlimit=max&exintro=&explaintext=&pilimit=max&generator=search&gsrnamespace=0&gsrlimit=10&gsrsearch=",
    $searchResults = $('#search-results');

  function getSearchResults(searchTerm) {
    var url = CALLBACK + searchTerm;
    return $.ajax({
      url: url,
      type: 'GET',
      dataType: 'jsonp',
      headers: {'Api-User-Agent': 'WikiReader/0.1.0'}
    });
  }

  function displaySearchResults(data) {
    var prop,
      page,
      pages = data.query.pages,
      html = "";
    
    for (prop in pages) {
      if (pages.hasOwnProperty(prop)) {
        page = pages[prop];
        html += '<a class="result-item" href="' + PAGE_URL +
          page.pageid + '" target="_">\n  <h2>' + page.title +
          '</h2>\n  <p>' + page.extract + '</p>\n</a>';
      }
    }
    
    $searchResults.html(html);
  }
  
  function clearSearchResults() {
    $searchResults.html('');
  }

  $(function () {
    $('#search').on('keyup', function (e) {
      var searchTerm = $(this).val();
      if (searchTerm.length === 0) {
        clearSearchResults();
        return;
      }

      getSearchResults(searchTerm).done(displaySearchResults);
    });
  });
  
}(window.jQuery));