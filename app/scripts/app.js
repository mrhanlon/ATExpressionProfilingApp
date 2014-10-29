(function(window, $, undefined) {
  'use strict';

  console.log('Hello, ATExpressionProfilingApp!');
  var appContext = $('[data-app-name="atexpressionprofilingapp"]');

  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

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
            'lengthMenu': [ 5, 10, 25, 50, 100 ],
            'processing': true,
            'ajax': {
                'url': myUrl,
                'dataSrc': 'result',
                'headers': {
                    'Authorization': 'Bearer ' + Agave.token.accessToken
                  },
                  'error': function(jqXHR, textStatus, errorThrown){
                    console.error('Error: ' + textStatus, errorThrown);
                  }
                },
                'columns': [
                  { 'data': 'transcript', 'title': 'Gene' },
                  { 'data': 'expression_record.material_text_description', 'title': 'Material' },
                  { 'data': 'expression_record.cycle_time', 'title': 'Cycle Time' },
                  { 'data': 'expression_record.cycle_time_stdev', 'title': 'Std dev (+)' },
                  { 'data': 'expression_record.ratio_to_invariants', 'title': 'Ratio To Invariants' },
                  { 'data': 'expression_record.ratio_to_invariants_stdev', 'title': 'Std dev (+)' },
                  { 'data': 'expression_record.absolute_concentration', 'title': 'Absolute Concentration' },
                  { 'data': 'expression_record.absolute_concentration_stdev', 'title': 'Std dev (+)' },
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
