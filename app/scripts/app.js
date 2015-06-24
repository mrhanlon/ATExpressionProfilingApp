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

    //var imageSrc = 'https://api.araport.org/community/v0.3/eriksf-dev/image_by_id_v0.1/search';
    var imageSrc = 'http://www.jcvi.org/arabidopsis/qpcr/get_image.php';

    var templates = {
        resultTable: _.template('<table class="table table-striped table-bordered"><caption>Results from the Arabidopsis 2010 Expression Database</caption><thead><tr><th>Gene</th><th>Material</th><th>Cycle Time</th><th>Std dev (+)</th><th>Ratio to Invariants</th><th>Std dev (+)</th><th>Absolute Concentration</th><th>Std dev (+)</th></tr></thead><tbody><% _.each(result, function(r) { %><tr><td><%= r.transcript %> <button name="gene-report" data-locus="<%= r.transcript %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle"></i><span class="sr-only">Get Gene Report</span></button></td><td><%= r.expression_record.material_text_description %></td><td><%= r.expression_record.cycle_time %></td><td><%= r.expression_record.cycle_time_stdev %></td><td><%= r.expression_record.ratio_to_invariants %></td><td><%= r.expression_record.ratio_to_invariants_stdev %></td><td><%= r.expression_record.absolute_concentration %></td><td><%= r.expression_record.absolute_concentration_stdev %></td></tr><% }) %></tbody></table>'),
        comparisonTable: _.template('<table class="table table-striped table-bordered"><caption>Results from the Arabidopsis 2010 Expression Database</caption><thead><tr><th>Gene</th><th>Material 1</th><th>Expression Value (fmol/mg)</th><th>Std dev (+)</th><th>Material 2</th><th>Expression Value (fmol/mg)</th><th>Std dev (+)</th></tr></thead><tbody><% _.each(result, function(r) { %><tr><td><%= r.transcript %> <button name="gene-report" data-locus="<%= r.transcript %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle"></i><span class="sr-only">Get Gene Report</span></button></td><td><%= r.expression_comparison_record.material1_text_description %></td><td><%= r.expression_comparison_record.expression_value_material1 %></td><td><%= r.expression_comparison_record.expression_value_material1_stdev %></td><td><%= r.expression_comparison_record.material2_text_description %></td><td><%= r.expression_comparison_record.expression_value_material2 %></td><td><%= r.expression_comparison_record.expression_value_material2_stdev %></td></tr><% }) %></tbody></table>'),
        geneReport: _.template('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4>Gene Report: <%= locus %></h4></div><div class="modal-body"><% _.each(properties, function(prop) { %><h3><%= prop.type.replace("_"," ") %></h3><p><%= prop.value %></p><% }) %></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>'),
        imageTable: _.template('<table id="iTable" class="table table-striped table-bordered">' +
                                  '<thead><tr>' +
                                  '<th></th>' +
                                  '<th>Gene</th>' +
                                  '<th>Line</th>' +
                                  '</tr></thead><tbody>' +
                                  '<% _.each(result, function(r) { %>' +
                                  '<tr>' +
                                  '<td class="details-control"><i class="fa fa-plus-square fa-lg"></i></td>' +
                                  '<td><%= r.locus %><button name="gene-report" data-locus="<%= r.locus %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle fa-lg"></i><span class="sr-only">Get Gene Report</span></button></td>' +
                                  '<td><%= r.line_record.line_id %></td>' +
                                  '</tr>' +
                                  '<% }) %>' +
                                  '</tbody>' +
                                  '</table>'),
        imageDetailRow: _.template('<table class="table table-striped table-bordered">' +
                                   '<thead><tr>' +
                                   '<th></th>' +
                                   '<th>PO Code</th>' +
                                   '<th>PO Name</th>' +
                                   '<th>Expression?</th>' +
                                   '</tr></thead><tbody>' +
                                   '<% _.each(result, function(r) { %>' +
                                   '<tr>' +
                                   '<td rowspan="<%= r.image_record.po_codes.length %>"><img src="' + imageSrc +'?image_id=<%= r.image_record.image_id %>&width=160"></td>' +
                                   '<td><%= r.image_record.po_codes[0].po_code %></td>' +
                                   '<td><%= r.image_record.po_codes[0].po_name %></td>' +
                                   '<td><%= r.image_record.po_codes[0].expression %></td>' +
                                   '</tr>' +
                                   '<% if (r.image_record.po_codes.length > 1) { %>' +
                                   '<% for(i=1; i < r.image_record.po_codes.length; i++) { %>' +
                                   '<tr>' +
                                   '<td><%= r.image_record.po_codes[i].po_code %></td>' +
                                   '<td><%= r.image_record.po_codes[i].po_name %></td>' +
                                   '<td><%= r.image_record.po_codes[i].expression %></td>' +
                                   '</tr>' +
                                   '<% } %>' +
                                   '<% } %>' +
                                   '<% }) %>' +
                                   '</tbody></table>')
    };

    //draw individual gen expression table
    var showResults = function showResults(json) {

        if ( ! (json && json.obj) || json.obj.status !== 'success') {
            $('.gene_results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.gene_results', appContext).html(templates.resultTable(json.obj));

        $('button[name=gene-report]', appContext).on('click', function(e) {
            e.preventDefault();

            var locus = $(this).attr('data-locus');

            var query = {
                locus: locus.slice(0, locus.indexOf('.'))
            };

            Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.2.0', 'queryParams': query},
                function(search) {
                    var html = templates.geneReport(search.obj.result[0]);
                    $(html).appendTo('body').modal();
                }
            );
        });

        $('.gene_results table', appContext).dataTable( {'lengthMenu': [5, 10, 25, 50, 100]} );
    };

    //draw expression comparison table
    var showCompResults = function showCompResults(json) {

        if ( ! (json && json.obj) || json.obj.status !== 'success') {
            $('.comp_results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.comp_results', appContext).html(templates.comparisonTable(json.obj));

        $('button[name=gene-report]', appContext).on('click', function(e) {
            e.preventDefault();

            var locus = $(this).attr('data-locus');

            var query = {
                locus: locus.slice(0, locus.indexOf('.'))
            };

            Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.2.0', 'queryParams': query},
                function(search) {
                    var html = templates.geneReport(search.obj.result[0]);
                    $(html).appendTo('body').modal();
                }
            );
        });

        $('.comp_results table', appContext).dataTable( {'lengthMenu': [5, 10, 25, 50, 100]} );
    };

    // draw reporter image table
    var showImageResults = function showImageResults(json) {

        if ( ! (json && json.obj) || json.obj.status !== 'success') {
            $('.reporter_image_results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.reporter_image_results', appContext).html(templates.imageTable(json.obj));
        var iTable = $('.reporter_image_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                'columnDefs': [{'targets': 0,
                                                                                                'searchable': false,
                                                                                                'orderable': false,
                                                                                                'width': '25px'}]} );

        $('.reporter_image_results table tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = iTable.row(tr);

            if ( row.child.isShown() ) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
                $(this).html('<i class="fa fa-plus-square fa-lg">');
            } else {
                // Open this row
                var line = row.data()[2];
                console.log('LINE: ' + line);
                var query = { line: line };
                var detail = '<div id="detailResult"></div>';
                row.child(detail).show();
                $(this).html('<i class="fa fa-minus-square fa-lg">');
                tr.addClass('shown');
                Agave.api.adama.search(
                    {'namespace': 'eriksf-dev', 'service': 'images_data_by_line_v0.1', 'queryParams': query},
                    function(search) {
                        var html = templates.imageDetailRow(search.obj);
                        $('#detailResult', appContext).html(html);
                    }
                );
            }
        } );

        $('button[name=gene-report]', appContext).on('click', function(e) {
            e.preventDefault();

            var locus = $(this).attr('data-locus');

            var query = {
                locus: locus
            };

            Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.2.0', 'queryParams': query},
                function(search) {
                    var html = templates.geneReport(search.obj.result[0]);
                    $(html).appendTo('body').modal();
                }
            );
        });

    };

    var showError = function(err) {
        $('.error', appContext).html('<div class="alert alert-danger">Error contacting the server! Please try again later.</div>');
        console.error('Status: ' + err.obj.status + '  Message: ' + err.obj.message);
    };

    /* go! */
    init();

    $('#expression_gene_form_reset').on('click', function() {
        $('.error').empty();
        $('.gene_results').empty();
        $('#expression_gene').val('');
        $('#expression_tissue').val('none');
    });

    $('#expression_comp_form_reset').on('click', function() {
        $('.error').empty();
        $('.comp_results').empty();
        $('#fold_change').val('');
        $('#expression_tissue1').val('');
        $('#expression_tissue2').val('');
    });

    $('#reporter_image_form_reset').on('click', function() {
        $('.error').empty();
        $('.reporter_image_results').empty();
        $('#ri_gene').val('');
    });

    $('form[name=reporter_image_form]').on('submit', function(e) {
        e.preventDefault();

        var query = {
            locus: this.ri_gene.value,
        };

        $('.reporter_image_results').empty();
        $('.error').empty();
        Agave.api.adama.search({
            'namespace': 'eriksf-dev',
            'service': 'lines_by_locus_v0.1',
            'queryParams': query
        }, showImageResults, showError);
    }); /// end gene submit function

    $('form[name=expression_gene_form]').on('submit', function(e) {
        e.preventDefault();

        var query = {
            transcript: this.expression_gene.value,
        };
        if (this.expression_tissue.value !== 'none') {
            query.material = this.expression_tissue.value;
        }

        $('.gene_results').empty();
        $('.error').empty();
        Agave.api.adama.search({
            'namespace': 'vivek-dev',
            'service': 'expression_per_gene_tissue_02_v0.2',
            'queryParams': query
        }, showResults, showError);
    }); /// end gene submit function

    $('form[name=expression_comp_form]').on('submit', function(e) {
        e.preventDefault();

        var query = {
            material1: this.expression_tissue1.value,
            material2: this.expression_tissue2.value,
            foldchange: this.fold_change.value
        };

        $('.comp_results').empty();
        $('.error').empty();
        Agave.api.adama.search({
            'namespace': 'eriksf-dev',
            'service': 'expression_condition_comparison_v0.2',
            'queryParams': query
        }, showCompResults, showError);
    }); /// end comparison submit function
  });

})(window, jQuery, _);
