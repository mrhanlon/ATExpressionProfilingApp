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
        resultTable: _.template('<table class="table table-striped table-bordered at-table">' +
                                '<caption>Results from the Arabidopsis 2010 Expression Database</caption>' +
                                '<thead><tr>' +
                                '<th>Gene</th>' +
                                '<th>Material</th>' +
                                '<th>Cycle Time</th>' +
                                '<th>Std dev (+)</th>' +
                                '<th>Ratio to Invariants</th>' +
                                '<th>Std dev (+)</th>' +
                                '<th>Absolute Concentration</th>' +
                                '<th>Std dev (+)</th></tr></thead><tbody>' +
                                '<% _.each(result, function(r) { %>' +
                                '<tr>' +
                                '<td><%= r.transcript %><a href="#gene-report" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-locus="<%= r.transcript %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle"></i><span class="sr-only">Get Gene Report</span></a></td>' +
                                '<td><%= r.expression_record.material_text_description %></td>' +
                                '<td><%= r.expression_record.cycle_time %></td>' +
                                '<td><%= r.expression_record.cycle_time_stdev %></td>' +
                                '<td><%= r.expression_record.ratio_to_invariants %></td>' +
                                '<td><%= r.expression_record.ratio_to_invariants_stdev %></td>' +
                                '<td><%= r.expression_record.absolute_concentration %></td>' +
                                '<td><%= r.expression_record.absolute_concentration_stdev %></td>' +
                                '</tr>' +
                                '<% }) %>' +
                                '</tbody></table>'),
        comparisonTable: _.template('<table class="table table-striped table-bordered at-table">' +
                                    '<caption>Results from the Arabidopsis 2010 Expression Database</caption>' +
                                    '<thead><tr>' +
                                    '<th>Gene</th>' +
                                    '<th>Material 1</th>' +
                                    '<th>Expression Value (fmol/mg)</th>' +
                                    '<th>Std dev (+)</th>' +
                                    '<th>Material 2</th>' +
                                    '<th>Expression Value (fmol/mg)</th>' +
                                    '<th>Std dev (+)</th>' +
                                    '</tr></thead><tbody>' +
                                    '<% _.each(result, function(r) { %>' +
                                    '<tr>' +
                                    '<td><%= r.transcript %><a href="#gene-report" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-locus="<%= r.transcript %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle"></i><span class="sr-only">Get Gene Report</span></a></td>' +
                                    '<td><%= r.expression_comparison_record.material1_text_description %></td>' +
                                    '<td><%= r.expression_comparison_record.expression_value_material1 %></td>' +
                                    '<td><%= r.expression_comparison_record.expression_value_material1_stdev %></td>' +
                                    '<td><%= r.expression_comparison_record.material2_text_description %></td>' +
                                    '<td><%= r.expression_comparison_record.expression_value_material2 %></td>' +
                                    '<td><%= r.expression_comparison_record.expression_value_material2_stdev %></td>' +
                                    '</tr>' +
                                    '<% }) %>' +
                                    '</tbody></table>'),
        imageTable: _.template('<table class="table table-striped table-bordered at-table image-table">' +
                                  '<thead><tr>' +
                                  '<th></th>' +
                                  '<th>Gene</th>' +
                                  '<th>Line</th>' +
                                  '</tr></thead><tbody>' +
                                  '<% _.each(result, function(r) { %>' +
                                  '<tr>' +
                                  '<td class="details-control"><i class="fa fa-plus-square fa-lg"></i></td>' +
                                  '<td><%= r.locus %><a href="#gene-report" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-locus="<%= r.locus %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle fa-lg"></i><span class="sr-only">Get Gene Report</span></a></td>' +
                                  '<td><%= r.line_record.line_id %></td>' +
                                  '</tr>' +
                                  '<% }) %>' +
                                  '</tbody>' +
                                  '</table>'),
        imageDetailRow: _.template('<table class="table table-striped table-bordered at-table image-detail-table">' +
                                   '<thead><tr>' +
                                   '<th></th>' +
                                   '<th>PO Code</th>' +
                                   '<th>PO Name</th>' +
                                   '<th>Expression?</th>' +
                                   '</tr></thead><tbody>' +
                                   '<% _.each(result, function(r) { %>' +
                                   '<tr>' +
                                   '<td rowspan="<%= r.image_record.po_codes.length %>"><img class="thumbnail" src="<%= r.image_record.image_url %>"></td>' +
                                   '<td><%= r.image_record.po_codes[0].po_code %><a href="#po-report" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-po_code="<%= r.image_record.po_codes[0].po_code %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle fa-lg"></i><span class="sr-only">Get PO Report</span></a></td>' +
                                   '<td><%= r.image_record.po_codes[0].po_name %></td>' +
                                   '<td><%= r.image_record.po_codes[0].expression %></td>' +
                                   '</tr>' +
                                   '<% if (r.image_record.po_codes.length > 1) { %>' +
                                   '<% for(i=1; i < r.image_record.po_codes.length; i++) { %>' +
                                   '<tr>' +
                                   '<td><%= r.image_record.po_codes[i].po_code %><a href="#po-report" tabindex="0" role="button" data-toggle="popover" data-trigger="focus" data-po_code="<%= r.image_record.po_codes[i].po_code %>" class="btn btn-link btn-sm"><i class="fa fa-info-circle fa-lg"></i><span class="sr-only">Get PO Report</span></a></td>' +
                                   '<td><%= r.image_record.po_codes[i].po_name %></td>' +
                                   '<td><%= r.image_record.po_codes[i].expression %></td>' +
                                   '</tr>' +
                                   '<% } %>' +
                                   '<% } %>' +
                                   '<% }) %>' +
                                   '</tbody></table>'),
        poReportPopover: _.template('<h3>Accession</h3><p><%= po_code %></p>' +
                             '<h3>Name</h3><p><%= po_definition_record.po_name %></p>' +
                             '<h3>Namespace</h3><p><%= po_definition_record.po_namespace %></p>' +
                             '<h3>Definition</h3><p><%= po_definition_record.po_def %></p>'),
        imageFull: _.template('<div class="modal modal-wide fade" tabindex="-1" role="dialog" aria-hidden="true">' +
                              '<div class="modal-dialog">' +
                              '<div class="modal-content">' +
                              '<div class="modal-header">' +
                              '<button type="button" data-dismiss="modal" class="close">' +
                              '<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>' +
                              '</button>' +
                              '</div>' +
                              '<div class="modal-body">' +
                              '<img class="full-image" src="<%= image_url %>">' +
                              '</div>' +
                              '<div class="modal-footer">' +
                              '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                              '</div></div></div></div>'),
        geneReportPopover: _.template('<% _.each(properties, function(prop) { %>' +
                                '<h3><%= prop.type.replace("_"," ") %></h3>' +
                                '<p><%= prop.value %></p>' +
                                '<% }) %>'),
    };

    // gene report handler
    var geneReportHandler = function geneReportHandler() {
        $('a[href=#gene-report]', appContext).on('click', function(e) {
            e.preventDefault();
            var el = $(this);
            var locus = el.attr('data-locus');
            if (locus.indexOf('.') !== -1) {
                locus = locus.slice(0, locus.indexOf('.'));
            }
            var query = { locus: locus };
            Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.2.0', 'queryParams': query},
                function(search) {
                    el.popover({title: 'Gene Report: ' + locus,
                                content: templates.geneReportPopover(search.obj.result[0]),
                                trigger: 'manual',
                                html: true,
                                template: '<div class="popover popover-definition" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});
                    el.popover('toggle');
                    $('.close').remove();
                    $('.popover-title').append('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
                    $('.close').click(function () {
                        $(this).parents('.popover').popover('hide');
                    });
                }
            );
        });
    };

    //draw individual gen expression table
    var showResults = function showResults(json) {

        if ( ! (json && json.obj) || json.obj.status !== 'success') {
            $('.gene_results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.gene_results_progress', appContext).addClass('hidden');
        $('.gene_results', appContext).html(templates.resultTable(json.obj));

        geneReportHandler();

        $('.gene_results table', appContext).dataTable( {'lengthMenu': [5, 10, 25, 50, 100]} );
    };

    //draw expression comparison table
    var showCompResults = function showCompResults(json) {

        if ( ! (json && json.obj) || json.obj.status !== 'success') {
            $('.comp_results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.comp_results_progress', appContext).addClass('hidden');
        $('.comp_results', appContext).html(templates.comparisonTable(json.obj));

        geneReportHandler();

        $('.comp_results table', appContext).dataTable( {'lengthMenu': [5, 10, 25, 50, 100]} );
    };

    // draw reporter image table
    var showImageResults = function showImageResults(json) {

        if ( ! (json && json.obj) || json.obj.status !== 'success') {
            $('.reporter_image_results', appContext).html('<div class="alert alert-danger">Invalid response!</div>');
            return;
        }

        $('.reporter_image_results_progress', appContext).addClass('hidden');
        $('.reporter_image_results', appContext).html(templates.imageTable(json.obj));
        var iTable = $('.reporter_image_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                'columnDefs': [{'targets': 0,
                                                                                                'searchable': false,
                                                                                                'orderable': false,
                                                                                                'width': '25px'}]} );

        $('.reporter_image_results table tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = iTable.row(tr);
            var row_number = row.index();

            if ( row.child.isShown() ) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
                $(this).html('<i class="fa fa-plus-square fa-lg">');
            } else {
                // Open this row
                var line_id = row.data()[2];
                console.log('LINE: ' + line_id);
                var query = { line_id: line_id };
                var detail = '<div id="detailResult-' + row_number + '"></div>';
                row.child(detail).show();
                $(this).html('<i class="fa fa-minus-square fa-lg">');
                tr.addClass('shown');
                Agave.api.adama.search(
                    {'namespace': 'jcvi', 'service': 'images_data_by_line_v0.2', 'queryParams': query},
                    function(search) {
                        var html = templates.imageDetailRow(search.obj);
                        $('#detailResult-'+row_number, appContext).html(html);
                    }
                );
            }
        } );

        geneReportHandler();

        $('.reporter_image_results table', appContext).on('click', 'a[href=#po-report]', function(e) {
            e.preventDefault();
            var el = $(this);
            var po_code = $(this).attr('data-po_code');
            var query = { po_code: po_code };
            Agave.api.adama.search(
                {'namespace': 'jcvi', 'service': 'podefinition_by_code_v0.1', 'queryParams': query},
                function(search) {
                    el.popover({title: 'Plant Ontology Report - ' + po_code,
                                content: templates.poReportPopover(search.obj.result[0]),
                                trigger: 'manual',
                                html: true,
                                template: '<div class="popover popover-definition" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});
                    el.popover('toggle');
                    $('.close').remove();
                    $('.popover-title').append('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
                    $('.close').click(function () {
                        $(this).parents('.popover').popover('hide');
                    });
                }
            );
        });

        $('.reporter_image_results table', appContext).on('click', '.thumbnail', function(e) {
            e.preventDefault();

            var image_url = $(this).attr('src');
            var query = { image_url: image_url };

            var html = templates.imageFull(query);
            $(html).appendTo('body').modal();
        });

    };

    var showError = function(err) {
        $('.gene_results_progress', appContext).addClass('hidden');
        $('.comp_results_progress', appContext).addClass('hidden');
        $('.reporter_image_results_progress', appContext).addClass('hidden');
        $('.error', appContext).html('<div class="alert alert-danger">Error contacting the server! Please try again later.</div>');
        console.error('Status: ' + err.obj.status + '  Message: ' + err.obj.message);
    };

    /* go! */
    init();

    $('#expression_transcript', appContext).selectize({
        options: [],
        maxOptions: 2000,
        labelField: 'transcript',
        valueField: 'transcript',
        searchField: 'transcript',
        sortField: 'transcript',
        create: false,
        persist: false,
        render: {
            option: function(item, escape) {
                return '<div>' + escape(item.transcript) + '</div>';
            }
        },
        load: function (query, callback) {
            if (!query.length) { return callback(); }
                var params = { search_term: query };
                Agave.api.adama.search({
                    'namespace': 'jcvi',
                    'service': 'search_available_transcripts_v0.1',
                    'queryParams': params
                }, function (search) {
                       callback(search.obj);
                   });
            }
    });

    $('#ri_gene', appContext).selectize({
        options: [],
        maxOptions: 2000,
        labelField: 'locus',
        valueField: 'locus',
        searchField: 'locus',
        sortField: 'locus',
        create: false,
        persist: false,
        render: {
            option: function(item, escape) {
                return '<div>' + escape(item.locus) + '</div>';
            }
        },
        load: function (query, callback) {
            if (!query.length) { return callback(); }
                var params = { search_term: query };
                Agave.api.adama.search({
                    'namespace': 'jcvi',
                    'service': 'search_available_locus_ids_v0.1',
                    'queryParams': params
                }, function (search) {
                       callback(search.obj);
                   });
            }
    });

    $('#expression_gene_form_reset').on('click', function() {
        $('.error').empty();
        $('.gene_results').empty();
        $('#expression_transcript', appContext)[0].selectize.clearOptions();
        $('#expression_transcript', appContext)[0].selectize.clear(true);
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
        $('#ri_gene', appContext)[0].selectize.clearOptions();
        $('#ri_gene', appContext)[0].selectize.clear(true);
    });

    $('form[name=reporter_image_form]').on('submit', function(e) {
        e.preventDefault();

        var query = {
            locus: this.ri_gene.value,
        };

        $('.reporter_image_results').empty();
        $('.error').empty();
        $('.reporter_image_results_progress', appContext).removeClass('hidden');
        Agave.api.adama.search({
            'namespace': 'jcvi',
            'service': 'lines_by_locus_v0.1',
            'queryParams': query
        }, showImageResults, showError);
    }); /// end gene submit function

    $('form[name=expression_gene_form]').on('submit', function(e) {
        e.preventDefault();

        var query = {
            transcript: this.expression_transcript.value,
        };
        if (this.expression_tissue.value !== 'none') {
            query.material = this.expression_tissue.value;
        }

        $('.gene_results').empty();
        $('.error').empty();
        $('.gene_results_progress', appContext).removeClass('hidden');
        Agave.api.adama.search({
            'namespace': 'jcvi',
            'service': 'expression_per_gene_tissue_v0.3',
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
        $('.comp_results_progress', appContext).removeClass('hidden');
        Agave.api.adama.search({
            'namespace': 'jcvi',
            'service': 'expression_condition_comparison_v0.3',
            'queryParams': query
        }, showCompResults, showError);
    }); /// end comparison submit function
  });

})(window, jQuery, _);
