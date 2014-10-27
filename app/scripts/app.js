(function(window, $, undefined) {
  'use strict';

  console.log('Hello, ATExpressionProfilingApp!');

  var appContext = $('[data-app-name="atexpressionprofilingapphelp"]');

  /* Generate Agave API docs */
  window.addEventListener('Agave::ready', function() {
    var Agave, help, helpItem, helpDetail, methods, methodDetail;

    Agave = window.Agave;

    appContext.html('<h2 id="toggleHelp">Hello AIP Science App &plus; Agave API!</h2><div class="api-help list-group"></div><hr><div class="api-info"></div><br>');

    help = $('.api-help', appContext);

    $('#toggleHelp').click(function() {
      $('.api-help').toggle();
    });

    $.each(Agave.api.apisArray, function(i, api) {
      helpItem = $('<a class="list-group-item">');
      help.append(helpItem);

      helpItem.append($('<h4>').text(api.name).append('<i class="pull-right fa fa-toggle-up"></i>'));
      helpDetail = $('<div class="api-help-detail">');
      helpDetail.append($('<p>').text(api.description));
      helpDetail.append('<h5>Methods</h5>');
      methods = $('<ul>');
      $.each(api.help(), function(i, m) {
        methodDetail = $('<li>');
        methodDetail.append('<strong>' + m + '</strong>');
        var details = api[m.trim()].help();
        if (details) {
          methodDetail.append('<br>').append('Parameters');
          methodDetail.append('<p style="white-space:pre-line;">' + details + '</p>');
        }
        methods.append(methodDetail);
      });
      helpDetail.append(methods);
      helpItem.append(helpDetail.hide());
    });

    $('.api-help > a', appContext).on('click', function() {
      if (! $(this).hasClass('list-group-item-info')) {
        // close other
        $('.api-help > a.list-group-item-info', appContext).removeClass('list-group-item-info').find('.fa').toggleClass('fa-toggle-up fa-toggle-down').end().find('.api-help-detail').slideToggle();
      }

      $(this).toggleClass('list-group-item-info');
      $('.fa', this).toggleClass('fa-toggle-up fa-toggle-down');
      $('.api-help-detail', this).slideToggle();
    });

    var info = $('.api-info', appContext);
    info.addClass('text-center');
    info.append('<p>' + Agave.api.info.title + ': ' + Agave.api.info.description + '</p>');
    info.append('<p><a href="mailto:' + Agave.api.info.contact + '">Contact</a> | <a href="' + Agave.api.info.license + '">License</a> | <a href="' + Agave.api.info.license + '">Terms of use</a></p>');

    var DEBUG, log, init, renderExpressionTable;

      DEBUG = true;
      log = function log( message ) {
        if ( DEBUG ) {
          console.log( message );
        }
      };

      init = function init() {
          log( 'Initializing app...' );
      };

      //draw interactions table
      renderExpressionTable = function renderExpressionTable(url, gene, tissue) {
        $('#expression_itable').empty();

        var myUrl = url;
        if (url.substr(-1) === '/') {
          myUrl = url.replace(/\/$/, '');
        }

        if (tissue !== 'none') {
            myUrl += '?transcript=' + gene + '&material=' + tissue;
        } else {
            myUrl += '?transcript=' + gene;
        }
        log('Grabbing data from ' + myUrl);
        log('Using authorization header: "Authorization: Bearer ' + Agave.token.accessToken + '"');

        $('#expression_itable').html('<table cellspacing="0" class="table table-striped table-bordered" id="etable"></table>');
        $('#etable').prepend('<caption>Results from the Arabidopsis 2010 Expression Database</caption>');
        $('#etable').dataTable( {
            "lengthMenu": [ 5, 10, 25, 50, 100 ],
            "processing": true,
            "ajax": {
                  "url": myUrl,
                  "dataSrc": "result",
                  "headers": {
                       "Authorization": "Bearer " + Agave.token.accessToken
                     },
                     "error": function(jqXHR, textStatus, errorThrown){
                       console.error("Error: " + textStatus, errorThrown);
                     }
            },
            "columns": [
                { "data": "transcript", "title": "Gene" },
                { "data": "expression_record.material_text_description", "title": "Material" },
                { "data": "expression_record.cycle_time", "title": "Cycle Time" },
                { "data": "expression_record.cycle_time_stdev", "title": "Std dev (+)" },
                { "data": "expression_record.ratio_to_invariants", "title": "Ratio To Invariants" },
                { "data": "expression_record.ratio_to_invariants_stdev", "title": "Std dev (+)" },
                { "data": "expression_record.absolute_concentration", "title": "Absolute Concentration" },
                { "data": "expression_record.absolute_concentration_stdev", "title": "Std dev (+)" },
            ]
        } );

        $('#expression_itable').removeClass('hidden');
      };

      /* go! */
      if (! $('#expression_viewer').hasClass('expression-viewer-processed') ) {
        // prevent duplicate initialization
        $('#expression_viewer').addClass('expression-viewer-processed');

        init();

        $('#expression_gene_form_reset').on('click', function() {
          $('#expression_itable').empty();
          $('#expression_itable').addClass('hidden');
          $('#expression_gene').val('');
          $('#expression_tissue').val('none');
          $('.result').empty();
        });

        $( 'form[name=expression_gene_form]' ).on( 'submit', function( e ) {
          e.preventDefault();

          var url = 'https://api.araport.org/community/v0.3/vivek-dev/expression_per_gene_tissue_02_v0.2/search';

          $('.result').empty();
          var gene = $('#expression_gene').val();
          var tissue = $('#expression_tissue').val();
          //did the user enter the name of a gene?
          if (gene.length > 0) {
              renderExpressionTable(url, gene, tissue);
          } else {
            window.alert('You must enter a gene first!');
          }
        }); /// end gene submit function
      }
  });

})(window, jQuery);
