$(document).ready(function () {
    AddCompareValidator();

    // Hiển thị tiêu đề tìm kiếm và grid theo menu
    var menuName = "" + $(".selected a").html();

    if (menuName != "undefined" && menuName.length > 1) {
        document.title = "Quản lý " + menuName.replace("Quản lý", "");
        $("#dvListTitle").html("Quản lý danh mục " + menuName);
        $("#pSearchTitle").html("Tìm kiếm " + menuName);
//        $("#dvFunTitle").html("Quản lý " + menuName);
//        $("#pReportTitle").html("Báo cáo  " + menuName);
    }

    // Đặt style cho các button
    RegisterButton();

    // Đăng ký các control trên form
    $(".smTab").kendoTabStrip({
        animation: {
            open: {
                effects: "fadeIn"
            }
        }
    });

    $(".lblTextbox").each(function () {
        if ($(this).val() == "") {
            $(this).val($(this).attr("title"));
            $(this).addClass("SearchLabel");
        }
    });

    $(".lblTextbox").focusin(function () {
        if ($(this).val() == $(this).attr("title")) {
            $(this).val("");
            $(this).removeClass("SearchLabel");
        }
    });
    $(".lblTextbox").focusout(function () {
        if ($(this).val() == "") {
            $(this).val($(this).attr("title"));
            $(this).addClass("SearchLabel");
        }
    });

    $(".combobox").smCombobox({});

    $(".autocombobox").smCombobox({
        AutoPostback: true
    });

    $(".bigint").smNumeric({});
    $(".decimal1").smNumeric({
        numOfDec: 1
    });
    $(".decimal2").smNumeric({
        numOfDec: 2
    });
    $(".decimal3").smNumeric({
        numOfDec: 3
    });
    $(".decimal4").smNumeric({
        numOfDec: 4
    });
    $(".decimal5").smNumeric({
        numOfDec: 5
    });
    $(".decimal6").smNumeric({
        numOfDec: 6
    });
    $("div .FileUpload").FileUpload({});

    $("div .FileDisplay").FileUpload({
        showDelete: false,
        showDrapDrop: false
    });

    $("div .ExcelUpload").FileUpload({
        allowedTypes: "xls,xlsx"
    });

    $("div .ExcelReadFile").FileUpload({
        allowedTypes: "xls,xlsx",
        readOnSuccess: true,
        maxFileCount: 1,
        maxFileSize: 10 * 1024 * 1024
    });

    $("div .ImageUpload").FileUpload({
        allowedTypes: "jpg,png,gif,ico"
    });

    $("div .IconUpload").FileUpload({
        allowedTypes: "jpg,png,gif,ico",
        multiple: false,
        maxFileCount: 1,
        showPreview: true
    });


    $("div .UploadFileView").FileUpload({
        showDelete: false,
        showDrapDrop: false,
        showPreviewButton: true
    });


    $(".date").datepicker();
    $(".colorpicker").colorpicker({
        strings: "Danh sách màu, màu cơ bản, Xem thêm, Danh sách"
    });

    // Xử lý sự kiện cho các button
    $('#divSeach input').bind('keypress', function (e) {
        if (e.keyCode == 13) {
            submitSearch();
            return false;
        }
    });

    $("#divSeach .autocombobox").change(function () {
        submitSearch();
        return false;
    });    

    $("#btnSearch").click(function () {
        submitSearch();
        return false;
    });

    $("#btnPopSearch").click(function () {
        popSearch();
        return false;
    });

    $("#btnClose").click(function () {
        if ($("#jdialog2").hasClass('ui-dialog-content')) {
            $("#jdialog2").html("").dialog('close');
            return false;
        }
        $("#jdialog").html("").dialog('close');
        return false;
    });

    $("#tblInput input[type='checkbox']").click(function () {
        $("#tblInput input[type='checkbox']").each(function () {
            var hiddenChk = "#hd" + $(this).attr("name");
            if ($(this).is(":checked"))
                $(hiddenChk).val("1");
            else
                $(hiddenChk).val("0");
        });
    });

    $(".ui-dialog-content input[type='file']").each(function () { $(this).css({ 'z-index': '1010' }); });

    $(".ui-dialog-titlebar-min-max").remove();
    $(".ui-dialog-titlebar-close").before("<a href='#' class='ui-dialog-titlebar-min-max ui-corner-all' role='button'><span id='btnMinMax' class='ui-icon ui-icon-arrow-4-diag'>Maximize</span></a>");

    $(".ui-dialog-titlebar-min-max").click(function () {
        // set full screen
        if ($(this).children().first().hasClass("ui-icon-arrow-4-diag")) {
            $(this).children().first().removeClass("ui-icon-arrow-4-diag");
            $(this).children().first().addClass("ui-icon-arrow-4");

            // Get current width, height
            formWidth = $(this).parent().parent().width();
            formHeight = $(this).parent().parent().height();

            $(this).parent().parent().width($(window).width() - 10);
            $(this).parent().parent().height($(window).height());
            $(this).parent().next().height($(window).height() - 50);
            var dialogID = $(this).parent().next().attr("id");
            $("#" + dialogID).dialog('option', 'position', 'top');
        } else {
            $(this).children().first().removeClass("ui-icon-arrow-4");
            $(this).children().first().addClass("ui-icon-arrow-4-diag");

            $(this).parent().parent().width(formWidth);
            $(this).parent().parent().height(formHeight);
            $(this).parent().next().height(formHeight - 50);
            var dialogID = $(this).parent().next().attr("id");
            $("#" + dialogID).dialog('option', 'position', 'middle');
        }
        $(window).trigger("resize");
    });
    $(".ui-dialog-titlebar").dblclick(function () {
        $(this).find(".ui-dialog-titlebar-min-max").first().click();
    });

});