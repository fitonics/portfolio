(function ($) {
  'use strict';
  
  var $profile,
    $search,
    USER_CALLBACK_URL = 'https://api.twitch.tv/kraken/users/{user}?callback=?',
    STREAM_CALLBACK_URL = 'https://api.twitch.tv/kraken/streams/{user}?callback=?',
    TWITCH_TV_BASE_URL = 'http://www.twitch.tv/',
    USERS = ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "medrybw", "noobs2ninjas", "beohoff", "brunofin", "comster404"];

  function getData(callback_url, user) {
    var url = callback_url.replace(/\{user\}/, user);
    return $.getJSON(url);
  }
  
  function getProfiles() {
    var index, promises = [];
    for (index = 0; index < USERS.length; index += 1) {
      promises.push(getData(USER_CALLBACK_URL, USERS[index]));
      promises.push(getData(STREAM_CALLBACK_URL, USERS[index]));
    }
    
    return $.when.apply($, promises);
  }
  
  function getProfileHTML(userData, streamData) {
    var status_icon = "fa-ban",
      profileHTML = '<a href="' + TWITCH_TV_BASE_URL +
        userData.name + '" class="profile" target="_">\n  <img src="';
    
    if (userData.logo) {
      profileHTML += userData.logo;
    } else {
      profileHTML += "https://www.placebear.com/50/50";
    }
    
    profileHTML += '" class="avatar">\n  <div class="details">\n    <span class="display-name">' + userData.display_name + '</span>';
    
    if (streamData.stream) {
      status_icon = "fa-check";
      profileHTML += '\n    <span class="status">' + streamData.stream.channel.status.substring(0, 30) + '...</span>';
    }
    
    profileHTML += '\n  </div>\n  <span class="fa ' + status_icon + '"></span>\n</a>\n';
    return profileHTML;
  }

  function displayProfiles() {
    var htmlData = '',
      allUsersPromise = getProfiles();

    allUsersPromise
      .done(function () {
        var index;
        for (index = 0; index < arguments.length; index += 2) {
          htmlData += getProfileHTML(arguments[index][0], arguments[index + 1][0]);
        }
      
        $('.profiles').html(htmlData);
        $profile = $('.profile');
      })
      .fail(function (jqXHR, statusText, err) {
        window.console.log("Error getting user info: " + err);
      });
  }

  function matchSearchTerm(searchTerm) {
    var isMatched,
      searchExpr = new RegExp(searchTerm, 'i');

    $('.profile:not(.hidden)').each(function () {
      isMatched = false;
      $(this).find('.display-name, .status').each(function () {
        isMatched = isMatched || ($(this).text().search(searchExpr) !== -1);
      });
      if (!isMatched) {
        $(this).addClass('hidden');
      }
    });
  }

  function updateProfiles(selection, searchTerm) {
    switch (selection) {
    case "Online":
      $profile.addClass('hidden');
      $('.profile:online').removeClass('hidden');
      break;
    case "Offline":
      $profile.addClass('hidden');
      $('.profile:offline').removeClass('hidden');
      break;
    default:
      $profile.removeClass('hidden');
      break;
    }

    if (searchTerm.length > 0) {
      matchSearchTerm(searchTerm);
    }
  }

  $(function () {
    $search = $('#search');

    $.extend($.expr[":"], {
      online: function (profile) {
        if (profile === null) {
          return null;
        }
        
        return $(profile).find('.fa-check').length > 0;
      }
    });

    $.extend($.expr[":"], {
      offline: function (profile) {
        if (profile === null) {
          return null;
        }
        
        return $(profile).find('.fa-ban').length > 0;
      }
    });

    $('.navbar').on('click', '.navbar-tab', function () {
      $('nav li.active').removeClass('active');
      $(this).addClass('active');
      updateProfiles($(this).text(), $search.val());
    });

    $search.on('keyup', function (e) {
      updateProfiles($('nav li.active').text(), $(this).val());
    });
    
    displayProfiles();
  });
}(window.jQuery));