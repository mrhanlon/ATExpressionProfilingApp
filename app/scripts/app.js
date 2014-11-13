/* global _ */
/* jshint camelcase: false */
(function(window, $, _, undefined) {
  'use strict';

  console.log('Hello, ATExpressionProfilingApp!');

  var appContext = $('[data-app-name="atexpressionprofilingapp"]');

  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    var DEBUG = true;
    var log = function log( message ) {
        if ( DEBUG ) {
          console.log( message );
        }
      };

    var init = function init() {
        log( 'Initializing app...' );
      };

    var templates = {
        resultTable: _.template('<table class="table table-striped table-bordered"><caption>Results from the Arabidopsis 2010 Expression Database</caption><thead><tr><th>Gene</th><th>Material</th><th>Cycle Time</th><th>Std dev (+)</th><th>Ratio to Invariants</th><th>Std dev (+)</th><th>Absolute Concentration</th><th>Std dev (+)</th></tr></thead><tbody><% _.each(result, function(r) { %><tr><td><%= r.transcript %> <button name="gene-report" data-locus="<%= r.transcript %>" class="btn btn-link btn-sm"><i class="fa fa-ellipsis-h"></i><span class="sr-only">Get Gene Report</span></button></td><td><%= r.expression_record.material_text_description %></td><td><%= r.expression_record.cycle_time %></td><td><%= r.expression_record.cycle_time_stdev %></td><td><%= r.expression_record.ratio_to_invariants %></td><td><%= r.expression_record.ratio_to_invariants_stdev %></td><td><%= r.expression_record.absolute_concentration %></td><td><%= r.expression_record.absolute_concentration_stdev %></td></tr><% }) %></tbody></table>'),
        geneReport: _.template('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4>Gene Report: <%= locus %></h4></div><div class="modal-body"><% _.each(properties, function(prop) { %><h3><%= prop.type.replace("_"," ") %></h3><p><%= prop.value %></p><% }) %></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>')
    };

    //draw interactions table
    var showResults = function showResults(json) {

        if ( ! (json && json.obj) ) {
            $('.results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.results', appContext).html(templates.resultTable(json.obj));

        $('button[name=gene-report]', appContext).on('click', function(e) {
            e.preventDefault();

            var locus = $(this).attr('data-locus');

            var query = {
                locus: locus.slice(0, locus.indexOf('.'))
            };

            Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.1', 'queryParams': query},
                function(search) {
                    var html = templates.geneReport(search.obj.result[0]);
                    $(html).appendTo('body').modal();
                }
            );
        });

        $('.results table', appContext).dataTable( {'lengthMenu': [5, 10, 25, 50, 100]} );
    };

    /* go! */
    init();

    $('#expression_gene_form_reset').on('click', function() {
        $('.results').empty();
        $('#expression_gene').val('');
        $('#expression_tissue').val('none');
    });

    $('form[name=expression_gene_form]').on('submit', function(e) {
        e.preventDefault();

        var query = {
            transcript: this.expression_gene.value,
        };
        if (this.expression_tissue.value !== 'none') {
            query.material = this.expression_tissue.value;
        }

        $('.results').empty();
        Agave.api.adama.search({
            'namespace': 'vivek-dev',
            'service': 'expression_per_gene_tissue_02_v0.2',
            'queryParams': query
        }, showResults);
    }); /// end gene submit function
  });

})(window, jQuery, _);
