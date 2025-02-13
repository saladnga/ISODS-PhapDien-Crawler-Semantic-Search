function SetComboboxSize(tablInputID) {
    var hasZero = 0;
    $("#" + tablInputID + " .combobox, " + "#" + tablInputID + " .autocombobox").not(".fixsize").each(function () {
        var width = $(this).parent().width();        
        if (width > 0) {
            $(this).parent().find("input").each(function () {
				if(width > 170)
					$(this).width(width * 97 / 100 - 16);
				else 
					$(this).width(width * 97 / 100 - 20);
                return;
            });
        }
        else
            hasZero = 1;
    });
    if (hasZero > 0)
        $(window).trigger("resize");
}

function ComboBox_BindData(controlID, jsonData, defaultVal) {
    var ajData = typeof jsonData != 'object' ? JSON.parse(jsonData) : jsonData;
    var lstOption = "";
    var defaultText = "";

    // Reset control
    $("#" + controlID).html(lstOption);
    $("#" + controlID).parent().children(".ui-autocomplete-input").val(defaultText);
    if (ajData != null) {
        if (defaultVal != null && defaultVal.length > 0) {
            for (var i = 0; i < ajData.length; i++) {
                if (ajData[i].Value == defaultVal) {
                    defaultText = ajData[i].Text;
                    lstOption += "<option value='" + ajData[i].Value + "' selected='selected'>" + ComboBoxEnCode(ajData[i].Text) + "</option>";
                }
                else
                    lstOption += "<option value='" + ajData[i].Value + "'>" + ComboBoxEnCode(ajData[i].Text) + "</option>";
            }            
        } else {
            for (var i = 0; i < ajData.length; i++) {
                if (i == 0) {
                    defaultText = ajData[i].Text;
                    lstOption += "<option value='" + ajData[i].Value + "' selected='selected'>" + ComboBoxEnCode(ajData[i].Text) + "</option>";
                }
                else
                    lstOption += "<option value='" + ajData[i].Value + "'>" + ComboBoxEnCode(ajData[i].Text) + "</option>";
            }
        }
        $("#" + controlID).html(lstOption);
        $("#" + controlID).parent().children(".ui-autocomplete-input").val(defaultText);        
    }
}

function ComboBox_SetVal(controlID, value) {
    var hdID = controlID.replace("dynctrl", "dynctrlreadonly");
    $("#" + controlID).val(value).trigger("change");
    $("#" + hdID).val(value);

    var selectedText = $("#" + controlID + " option:selected").text();
    $("#" + controlID).parent().children(".ui-autocomplete-input").val(selectedText);
}

(function ($) {
    $.fn.smCombobox = function (settings) {
        // settings
        var config = {
            AutoPostback: false,
            QuickAddForm: ""
        };
        if (settings) { $.extend(config, settings); }

        return this.each(function () {
            if (config.AutoPostback == true) {
                registerSpecial($(this).attr("id"));
            }
            else {
                registerNormal($(this).attr("id"));
            }

            if ($(this).hasClass("required")) {
                var lblHtml = "<label id='lblerr_" + $(this).attr("id") + "' class='error' style='display:none'>Yêu cầu nhập giá trị cho trường này</label>";
                $(this).next().after(lblHtml);
            }
            if (config.QuickAddForm.length > 0) {
                var hdID = "hdfrmQA" + $(this).attr("id");
                var hdQuickAddForm = "<input type='hidden' id='" + hdID + "' name='" + hdID + "' value='" + config.QuickAddForm + "' />";
                $(this).parent().append(hdQuickAddForm);
            }
            if ($(this).hasClass("readonly")) {
                $(this).parent().children().attr("disabled", true);
                $(this).parent().removeClass("quickadd-combobox");
                var hdID = $(this).attr("id").replace("dynctrl", "dynctrlreadonly");
                var hdreadonlyValue = "<input type='hidden' id='" + hdID + "' name='" + hdID + "' value='" + $(this).val() + "' />";
                $(this).parent().append(hdreadonlyValue);
            }

            if (!$(this).hasClass("fixsize") || $(this).hasClass("autosize")) {
                var width = $(this).parent().width();
                $(this).parent().find("input").each(function () {
                    if(width > 170)
						$(this).width(width * 97 / 100 - 16);
					else 
						$(this).width(width * 97 / 100 - 20);
                    return;
                });
            }

        });

    };
})(jQuery);

function registerSpecial(comboboxtype) {
    (function ($) {
        $.widget("ui.combobox", {
            _create: function () {
                var self = this,
					    select = this.element.hide(),
					    selected = select.children(":selected"),
					    value = selected.val() ? selected.text() : "";
                var input = this.input = $("<input>")
                        .click(function () {
                            $(this).select();
                            $(this).parent().find("button").click();
                        })
					    .insertAfter(select)
					    .val(value)
					    .autocomplete({
					        delay: 0,
					        minLength: 0,
					        source: function (request, response) {
					            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
					            response(select.children("option").map(function () {
					                var text = $(this).text();
					                var showText = ComboBoxEnCode($(this).text());
					                if (this.value && (!request.term || matcher.test(text)))
					                    return {
					                        label: showText.replace(
											    new RegExp(
												    "(?![^&;]+;)(?!<[^<>]*)(" +
												    $.ui.autocomplete.escapeRegex(request.term) +
												    ")(?![^<>]*>)(?![^&;]+;)", "gi"
											    ), "<strong>$1</strong>"),
					                        value: text,
					                        option: this
					                    };
					            }));
					        },
					        select: function (event, ui) {
					            ui.item.option.selected = true;
					            self._trigger("selected", event, {
					                item: ui.item.option
					            });
					            select.trigger("change");
					        },
					        change: function (event, ui) {
					            if (!ui.item) {
					                var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
									    valid = false;
					                select.children("option").each(function () {
					                    if ($(this).text().match(matcher)) {
					                        this.selected = valid = true;
					                        return false;
					                    }
					                });
					                if (!valid) {
					                    // remove invalid value, as it didn't match anything
					                    $(this).val("");
					                    if ($(select).filter("option[val='']").length == 0)
					                        $(select).html("<option value=''>  </option>" + $(select).html());
					                    select.val("-1");
					                    $(select).val("-1");
					                    return false;
					                }
					            }
					        }
					    })
					    .addClass("ui-widget ui-widget-content ui-corner-left");

                input.data("autocomplete")._renderItem = function (ul, item) {
                    return $("<li></li>")
						    .data("item.autocomplete", item)
						    .append("<a>" + item.label + "</a>")
						    .appendTo(ul);
                };

                this.button = $("<button type='button'>&nbsp;</button>")
					    .attr("tabIndex", -1)
					    .attr("title", "Show All Items")
					    .insertAfter(input)
					    .button({
					        icons: {
					            primary: "ui-icon-triangle-1-s"
					        },
					        text: false
					    })
					    .removeClass("ui-corner-all")
					    .addClass("ui-corner-right ui-button-icon")
					    .click(function () {
					        // close if already visible
					        if (input.autocomplete("widget").is(":visible")) {
					            input.autocomplete("close");
					            return;
					        }

					        // work around a bug (likely same cause as #5265)
					        $(this).blur();

					        // pass empty string as value to search for, displaying all results
					        input.autocomplete("search", "");
					        input.focus();
					    });
            },

            destroy: function () {
                this.input.remove();
                this.button.remove();
                this.element.show();
                $.Widget.prototype.destroy.call(this);
            }
        });
    })(jQuery);
    GoiCombobox(comboboxtype);
}

function registerNormal(controlid) {
    (function ($) {
        $.widget("ui.combobox", {
            _create: function () {
                var self = this,
					    select = this.element.hide(),
					    selected = select.children(":selected"),
					    value = selected.val() ? selected.text() : "";
                var input = this.input = $("<input>")
                        .click(function () {
                            $(this).select();
                            $(this).parent().find("button").click();
                        })
					    .insertAfter(select)
					    .val(value)
					    .autocomplete({
					        delay: 0,
					        minLength: 0,
					        source: function (request, response) {
					            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");

					            response(select.children("option").map(function () {
					                var text = $(this).text();
					                var showText = ComboBoxEnCode($(this).text());
					                if (this.value && (!request.term || matcher.test(text)))
					                    return {
					                        label: showText.replace(
											    new RegExp(
												    "(?![^&;]+;)(?!<[^<>]*)(" +
												    $.ui.autocomplete.escapeRegex(request.term) +
												    ")(?![^<>]*>)(?![^&;]+;)", "gi"
											    ), "<strong>$1</strong>"),
					                        value: text,
					                        option: this
					                    };
					            }));
					        },
					        select: function (event, ui) {
					            ui.item.option.selected = true;
					            self._trigger("selected", event, {
					                item: ui.item.option
					            });
					        },
					        change: function (event, ui) {
					            if (!ui.item) {
					                var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
									    valid = false;
					                select.children("option").each(function () {
					                    if ($(this).text().match(matcher)) {
					                        this.selected = valid = true;
					                        return false;
					                    }
					                });
					                if (!valid) {
					                    // remove invalid value, as it didn't match anything
					                    $(this).val("");
					                    if ($(select).filter("option[val='']").length == 0)
					                        $(select).html("<option value=''>  </option>" + $(select).html());
					                    select.val("-1");
					                    $(select).val("-1");
					                    input.data("autocomplete").term = "";
					                    return false;
					                }
					            }
					        }
					    })
					    .addClass("ui-widget ui-widget-content ui-corner-left");

                input.data("autocomplete")._renderItem = function (ul, item) {
                    return $("<li></li>")
						    .data("item.autocomplete", item)
						    .append("<a>" + item.label + "</a>")
						    .appendTo(ul);

                };

                this.button = $("<button type='button'>&nbsp;</button>")
					    .attr("tabIndex", -1)
					    .attr("title", "Show All Items")
					    .insertAfter(input)
					    .button({
					        icons: {
					            primary: "ui-icon-triangle-1-s"
					        },
					        text: false
					    })
					    .removeClass("ui-corner-all")
					    .addClass("ui-corner-right ui-button-icon")
					    .click(function () {
					        // close if already visible
					        if (input.autocomplete("widget").is(":visible")) {
					            input.autocomplete("close");
					            return;
					        }

					        // work around a bug (likely same cause as #5265)
					        $(this).blur();

					        // pass empty string as value to search for, displaying all results
					        input.autocomplete("search", "");
					        input.focus();
					    });
            },

            destroy: function () {
                this.input.remove();
                this.button.remove();
                this.element.show();
                $.Widget.prototype.destroy.call(this);
            }
        });
    })(jQuery);
    GoiCombobox(controlid);
}
function GoiCombobox(comboboxtype) {
    $("#" + comboboxtype).combobox();
    $("#toggle").click(function () {
        $("#" + comboboxtype).toggle();
    });
}

function inValidString(str) {
    var re = /\$|,|<|\!|\$|\./g;
    return re.test(str);
}

function filterNum(str) {
    re = /\$|,|@|#|~|`|\%|\*|\^|\&|\(|\)|\+|\=|\[|\-|\_|\]|\[|\}|\{|\;|\:|\'|\"|\<|\>|\?|\||\\|\!|\$|\./g;
    // remove special characters like "$" and "," etc...
    return str.replace(re, "");
}
function ComboBoxEnCode(value) {
    //    Rex các ký tự đặc biệt cần replace
    //    var specialRe = /\$|@|#|~|`|\%|\^|\&|\=|\[|\_|\]|\[|\}|\{|\;|\:|\'|\"|\<|\>|\?|\||\\|\!|\$/g;
    //    return String(value).replace(specialRe, "_");
    return $('<div/>').text(value).html();
}

function ComboBoxDecode(value) {
    return $('<div/>').html(value).text();
}

function registerRemoveItemButton(hdSelected) {
    $(".smAutoRemoveButoon").click(function () {
        try {
            var strValue = $(this).parent().next(".autotext-selected-text").attr("id").replace("selectedItem_", "");
            var arrSelectedVal = $("#" + hdSelected).val();
            var newVal = arrSelectedVal.replace(strValue + ";", "");
            if (newVal == ";")
                newVal = "";
            $("#" + hdSelected).val(newVal);
            $(this).parent().next(".autotext-selected-text").remove();
            $(this).parent().remove();
        } catch (err) { }
    });
}

function AutoTextBox_SelectItem(inputID, itemId, itemText) {
    var hdSelectd = inputID.replace("autotxt", "hdautotxt");
    var itemHtml = "<div class='' style='float: left; display: block; margin: 2px;'><img alt='' title='Xóa' src='/images/cross.png' style='border: none' class='smAutoRemoveButoon' /></div>";
    itemHtml += " <div class='autotext-selected-text' id='selectedItem_" + itemId + "'>" + itemText + "</div>";

    if ($("#" + hdSelectd).val().length > 0) {
        var tempVal = $("#" + hdSelectd).val().replace(itemId + ";", "");

        if (tempVal.length == $("#" + hdSelectd).val().length) {
            $("#" + hdSelectd).val($("#" + hdSelectd).val() + itemId + ";");
            $("#" + inputID).parent().parent().append(itemHtml);
        }
    }
    else {
        $("#" + hdSelectd).val(itemId + ";");
        $("#" + inputID).parent().parent().append(itemHtml);
    }
    registerRemoveItemButton(hdSelectd);
}

function AutoTextBox_SetDataSource(inputID, jsonData) {
    var source = [];

    $("#autotxtChildObject").parent().parent().find(".smAutoRemoveButoon").each(function () {
        $(this).click();
    });

    if (jsonData.length > 0) {
        var arrSource = typeof jsonData != 'object' ? JSON.parse(jsonData) : jsonData;

        for (var j = 0; j < arrSource.length; j++) {
            source.push({ id: arrSource[j].Value, name: arrSource[j].Text });
        }
        var autocomplete = $("#autotxtChildObject").data("kendoAutoComplete");
    }
    autocomplete.setDataSource(source);
}

(function ($) {
    $.fn.smAutoTextBox = function (settings) {
        // settings
        var config = {
            dataSource: [""],
            jsonData: "",
            dataTextField: "name",
            selectedVal: "",
            selectedText: "",
            filter: "contains",
            placeholder: "Tìm kiếm...",
            separator: "; ",
            QuickAddForm: "",
            validControlID: "",
            validType: 0 // 1 - Khong duoc chon trung voi validControl; 2 - Lay theo validControl
        };
        if (settings) { $.extend(config, settings); }

        if (config.jsonData.length > 0) {
            var arrSource = typeof config.jsonData != 'object' ? JSON.parse(config.jsonData) : config.jsonData;
            var source = [];
            for (var j = 0; j < arrSource.length; j++) {
                source.push({ id: arrSource[j].Value, name: arrSource[j].Text });
            }
            config.dataSource = source;
        }

        return this.each(function () {
            var inputID = $(this).attr("id");
            var lblHtml = "<label id='lblerr_" + inputID + "' class='error' style='display:none'>Yêu cầu nhập giá trị cho trường này</label>";
            $(this).after(lblHtml);

            var hdSelectd = inputID.replace("autotxt", "hdautotxt");
            var hdForm = inputID.replace("autotxt", "hdautoform");
            $("#" + inputID).parent().append("<input type='hidden' id='" + hdSelectd + "' name='" + hdSelectd + "' class='" + hdSelectd + "' />");
                        
            if (!$(this).hasClass("readonly")) 
                $("#" + inputID).parent().append("<input type='hidden' id='" + hdForm + "' name='" + hdForm + "' value='" + config.QuickAddForm + "' />");

            $(this).kendoAutoComplete({
                select: function (e) {
                    var dataItem = this.dataItem(e.item.index());
                    var itemText = ComboBoxEnCode(dataItem.name);
                    var itemId = dataItem.id;
                    if(config.validControlID.length > 0 && config.validType == 1)
                    {
                        var checkVal = $("#" + config.validControlID).val();
                        if(checkVal == itemId)
                            return;
                    }
                    var itemHtml = "<div class='' style='float: left; display: block; margin: 2px;'><img alt='' title='Xóa' src='/images/cross.png' style='border: none' class='smAutoRemoveButoon' /></div>";
                    itemHtml += " <div class='autotext-selected-text' id='selectedItem_" + itemId + "'>" + itemText + "</div>";

                    if ($("#" + hdSelectd).val().length > 0) {
                        var tempVal = $("#" + hdSelectd).val().replace(itemId + ";", "");

                        if (tempVal.length == $("#" + hdSelectd).val().length) {
                            $("#" + hdSelectd).val($("#" + hdSelectd).val() + itemId + ";");
                            $("#" + inputID).parent().parent().append(itemHtml);
                        }
                    }
                    else {
                        $("#" + hdSelectd).val(itemId + ";");
                        $("#" + inputID).parent().parent().append(itemHtml);
                    }
                    registerRemoveItemButton(hdSelectd);
                },
                change: function (e) {
                    var itemText = this.value();
                    this.value("");
                },
                dataSource: config.dataSource,
                dataTextField: config.dataTextField,
                filter: config.filter,
                placeholder: config.placeholder,
                separator: config.separator
            });
            if (config.selectedVal.length > 0 && config.selectedVal != ";") {
                $("#" + hdSelectd).val(config.selectedVal + ";");
                var arrText = config.selectedText.split(';');
                var arrID = config.selectedVal.split(';');

                for (var i = 0; i < arrText.length; i++) {
                    var itemHtml = "";
                    if (!$(this).hasClass("readonly"))                  
                        itemHtml += "<div class='' style='float: left; display: block; margin: 2px;'><img alt='' title='Xóa' src='/images/cross.png' style='border: none' class='smAutoRemoveButoon' /></div>";
                    itemHtml += " <div class='autotext-selected-text' id='selectedItem_" + ComboBoxEnCode(arrID[i]) + "'>" + ComboBoxEnCode(arrText[i]) + "</div>";
                    $("#" + inputID).parent().parent().append(itemHtml);
                }
                if (!$(this).hasClass("readonly"))                  
                    registerRemoveItemButton(hdSelectd);                
            }
            if ($(this).hasClass("readonly"))                 
                $(this).removeClass("quickadd-textbox");                
        });       
    };
})(jQuery);

(function ($) {
    $.fn.smExtAutoTextBox = function (settings) {
        // settings
        var config = {
            dataSource: [""],
            optionSource: "",
            optionWidth: "40px",
            jsonData: "",
            dataTextField: "name",
            selectedVal: "",
            selectedText: "",
            filter: "contains",
            placeholder: "Nhập @ để lấy tên trường dữ liệu",
            separator: "@",
            QuickAddForm: ""
        };
        if (settings) { $.extend(config, settings); }

        if (config.jsonData.length > 0) {
            var arrSource = typeof config.jsonData != 'object' ? JSON.parse(config.jsonData) : config.jsonData;
            var source = [];
            for (var j = 0; j < arrSource.length; j++) {
                source.push({ id: arrSource[j].Value, name: arrSource[j].Text });
            }
            config.dataSource = source;
        }

        return this.each(function () {
            var inputID = $(this).attr("id");
            var selectID = 'ddlExtSelect' + inputID;
            var lblHtml = "<label id='lblerr_" + inputID + "' class='error' style='display:none'>Yêu cầu nhập giá trị cho trường này</label>";
            var selectHtml = "<select style='float:left; width: " + config.optionWidth + "; height: 27px; margin-right:1px' class='extSelect' id='" + selectID + "' name='" + selectID + "'>";
            var arrSource = typeof config.optionSource != 'object' ? JSON.parse(config.optionSource) : config.optionSource;
            for (var j = 0; j < arrSource.length; j++) {
                selectHtml += "<option value='" + arrSource[j].Value + "'>" + arrSource[j].Text + "</option>";
            }
            selectHtml += "</select>";

            $("#" + inputID).before(selectHtml);
            $(this).after(lblHtml);

            var hdSelectd = inputID.replace("autotxt", "hdautotxt");
            var hdForm = inputID.replace("autotxt", "hdautoform");
            $("#" + inputID).parent().append("<input type='hidden' id='" + hdSelectd + "' name='" + hdSelectd + "' class='" + hdSelectd + "' />");
            $("#" + inputID).parent().append("<input type='hidden' id='" + hdForm + "' name='" + hdForm + "' value='" + config.QuickAddForm + "' />");
            $(this).kendoAutoComplete({
                select: function (e) {
                    var dataItem = this.dataItem(e.item.index());
                    var ruleText = $("#" + selectID + " option:selected").text();
                    var ruleID = $("#" + selectID).val();

                    var itemText = ' ' + ruleText + ' {' + ComboBoxEnCode(dataItem.name) + '}';
                    var itemId = ruleID + dataItem.id;
                    var itemHtml = "<div class='' style='float: left; display: block; margin: 2px;'><img alt='' title='Xóa' src='/images/cross.png' style='border: none' class='smAutoRemoveButoon' /></div>";
                    itemHtml += " <div class='autotext-selected-text' id='selectedItem_" + itemId + "'>" + itemText + "</div>";

                    if ($("#" + hdSelectd).val().length > 0) {
                        var tempVal = $("#" + hdSelectd).val().replace(itemId + ";", "");

                        if (tempVal.length == $("#" + hdSelectd).val().length) {
                            $("#" + hdSelectd).val($("#" + hdSelectd).val() + itemId + ";");
                            $("#" + inputID).parent().parent().append(itemHtml);
                        }
                    }
                    else {
                        $("#" + hdSelectd).val(itemId + ";");
                        $("#" + inputID).parent().parent().append(itemHtml);
                    }
                    registerRemoveItemButton(hdSelectd);
                },
                change: function (e) {
                    var itemText = this.value();
                    this.value("");
                },
                dataSource: config.dataSource,
                dataTextField: config.dataTextField,
                filter: config.filter,
                placeholder: config.placeholder,
                separator: config.separator
            });
            if (config.selectedVal.length > 0 && config.selectedVal != ";") {
                $("#" + hdSelectd).val(config.selectedVal + ";");
                var arrText = config.selectedText.split(';');
                var arrID = config.selectedVal.split(';');

                for (var i = 0; i < arrText.length; i++) {
                    var itemHtml = "<div class='' style='float: left; display: block; margin: 2px;'><img alt='' title='Xóa' src='/images/cross.png' style='border: none' class='smAutoRemoveButoon' /></div>";
                    itemHtml += " <div class='autotext-selected-text' id='selectedItem_" + ComboBoxEnCode(arrID[i]) + "'>" + ComboBoxEnCode(arrText[i]) + "</div>";
                    $("#" + inputID).parent().parent().append(itemHtml);
                }
                registerRemoveItemButton(hdSelectd);
            }
        });

    };
})(jQuery);

(function ($) {
    $.fn.smFunctionTextBox = function (settings) {
        // settings
        var config = {
            dataSource: [""],
            jsonData: "",
            dataTextField: "name",
            filter: "contains",
            placeholder: "Nhập @ để lấy tên trường dữ liệu",
            separator: "@",
            UsedBraces: false
        };
        if (settings) { $.extend(config, settings); }

        if (config.jsonData.length > 0) {
            var arrSource = typeof config.jsonData != 'object' ? JSON.parse(config.jsonData) : config.jsonData;
            var source = [];
            for (var j = 0; j < arrSource.length; j++) {
                source.push({ id: arrSource[j].Value, name: arrSource[j].Text });
            }
            config.dataSource = source;
        }
        return this.each(function () {
            $(this).kendoAutoComplete({
                select: function (e) {

                },
                change: function (e) {
                    var strVal = $.trim(this.value());
                    var lastChar = strVal.substring(strVal.length - 1);
                    if (lastChar == '@')
                        strVal = strVal.substring(0, strVal.length - 1);
                    if (config.UsedBraces && strVal.length > 1) {
                        strVal = strVal.replace(/\@/g, '{') + '}';
                        strVal = strVal.replace("}}", "}");
                        strVal = strVal.replace(";}", ";");
                    }
                    this.value(strVal);
                },
                dataSource: config.dataSource,
                dataTextField: config.dataTextField,
                filter: config.filter,
                placeholder: config.placeholder,
                separator: config.separator
            });
        });
    };
})(jQuery);

function destroyFunctionTextBox(ctrID) {
    $("#ctrID").kendoAutoComplete();
    var autocomplete = $("#ctrID").data("kendoAutoComplete");

    if (autocomplete != null && autocomplete != "undefined") {
        autocomplete.destroy();
        alert('ok');
    }
}

