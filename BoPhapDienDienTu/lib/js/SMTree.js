(function ($) {
    var lstMethods = {
        init: function (options) {
        },
        CreateTree: function (data, options) {
            var settings = $.extend({
                urlAction: "~/../ActionHandler.aspx",
                urlForm: "~/../DetailForm.aspx",
                //Url để load tree khi có sự kiện change ở tree
                urlLoadTree : "~/../ActionHandler.aspx?do=loadnodes",
                //Mở node sau khi load
                openAfterLoad : true,
                //Tên Tree
                TreeName: "",
                ItemIDName: "ItemID",
                // mảng các plugin
                lstPlugin: ["themes", "dnd", "search", "type", "crrm"],
                //Id searchbox
                IDSearchBox: 'txtFilterTree',
                //Chỉ hiện kết quả và cha của nó khi tìm kiếm
                ChiHienKetQua: true,
                //Mở tất cả các node khi load tree
                MoTatCa: true,
                //Khoảng cách giữa các node
                KhoangCachNode: "medium",
                //Tree Theme
                Theme: "default",
                //Hiển thị dấu chấm
                HienDauCham: true,
                //Hiển thị icon
                HienIcon: true,
                //Mở các node đến bậc leverOpen, Mặc định bậc của root là 0
                LeverOpen: 2,
                // mảng các icon cho node
                lstIcon: [],
                // Hiện textbox tìm kiếm
                ShowInput: true,
                //Tên Tree
                TreeName: "",
                //Sắp xếp bằng MAPC
                SortByMAPC: true,
                //Class cho textbox Tìm Kiếm
                InputClass: 'lblTextbox',
                //Style textbox Tìm kiếm
                InputStyle: 'height: 20px; padding: 2px 0px; margin: 2px 0px; border: 1px solid #98CEF9; background-color: #f3fbf5; width:80%',
                //Place holder box tìm Kiếm
                PlaceHolder: 'Tìm kiếm',
                MaPClength: 3,
                LoadOnLever : 0,
                onLoadTree : function(event,data){
                    if (data.node.parents.length==settings.LoadOnLever&&data.node.children.length==0) {
                        var parent = $(this).jstree('get_selected');
                        $.post(settings.urlLoadTree,{ "ItemId": parent[0] },function(data){
                            if(typeof data !="object")
                                data = JSON.parse(data);
                            if(!data.Erros) {
                                for (var i = 0; i < data.length; i++)
                                    $("#" + settings.TreeName + "DivTreeView").jstree('create_node', data[i].parent, data[i], "last", false, false);
                                if(!settings.openAfterLoad){
                                    $("#" + settings.TreeName + "DivTreeView").jstree('close_node',"#"+parent[0]);
                                    settings.openAfterLoad = !settings.openAfterLoad;
                                }
                            }
                        });
                    }
                },
                OnAction: function (event, data) {

                },
                onchange: function (event, data) {
                    var itemId = data.selected;
                    $("#listForm").html(imageLoading);
                    $.post(settings.urlForm + "?do=edit&&ItemId=" + itemId, function (data) {
                        $("#ThongTinChiTiet").html(data);
                    });
                    $("#ItemId").val(itemId);
                    return false;
                },
                onReady: function (event, data) {
                    return false;
                },
                //Hàm thực thi khi dịch chuyển node
                onMove: function (event, data) {
                    if (data.parent == "#" || data.old_parent == "#") {
                        alert("Thao tác không thực hiện được.");
                        $(this).jstree("deselect_all");
                    }
                    else {
                        $.post(settings.urlAction, {
                            "do": "ChangeNode",
                            "NodeId": data.node.id,
                            "Parent": data.parent,
                            "OldParent": data.old_parent,
                            "Position": data.position
                        }, function () {
                            myTree.jstree('select_node', $('#' + data.node.id).val);
                            myTree.jstree("open_node", $('#' + data.parent));
                            $("#ItemId").val(data.node.id);
                        });
                    }
                    var method = function () {
                        alert($(this).html());
                    }
                },
                onContext: function ($node) {
                    return {
                        createItem: {
                            "label": "Thêm",
                            "action": function (obj) {
                                console.log($node.id);
                            },
                            "_class": "class"
                        },
                        renameItem: {
                            "label": "Sửa",
                            "action": function (obj) {
                                console.log($node.id);
                            },
                        },
                        deleteItem: {
                            "label": "Xóa",
                            "action": function (obj) {
                                console.log($node.id);
                            },
                        }
                    }
                }
            }, options);
            var HTML = "";
            //Hiện textbox search
            if (settings.ShowInput) {
                HTML = "<div id='" + settings.TreeName + "divSeach' style='float: left; text-align: left; width: 100%; display:inline'>";
                HTML += "<input id='" + settings.TreeName + "txtFilterTree' maxlength='255' title='" + settings.PlaceHolder + "' placeholder='" + settings.PlaceHolder + "'"
                      + "class='" + settings.InputClass + "' style= '" + settings.InputStyle + "' />";
                HTML += "<img id='" + settings.TreeName + "collapse' src = '/images/treeview/collapse.png' width='9%' alt='Đóng tất cả'style='vertical-align: middle;'>";
                HTML += "<img id='" + settings.TreeName + "expand' src = '/images/treeview/expand.png' width='9%' alt='Mở tất cả' style='vertical-align: middle;'>";
            }
            HTML += "<input type='hidden' id='ItemId' />"
                        + "</div>"
                        + "<br />"
                        + "<div class='pane-content'>"
                            + "<div id='" + settings.TreeName + "DivTreeView'>"
                            + "</div>"
                        + "<div>";
            this.html(HTML);
            //Load tree

            var treeBox = $("#" + settings.TreeName + "DivTreeView");
            //var jsonData = JSON.parse(data);
			var jsonData = data;//new
            var ParentLength = 0;
			/*
            if(jsonData.length>0){
                ParentLength = jsonData[0].parent.length - settings.MaPClength;
                if (settings.LeverOpen >= 0 || settings.lstIcon.length > 0) {
                    for (var i = jsonData.length - 1; i >= 0; i--) {
                        //Mở tất cả các node có lever nỏ hơn hoặc bằng LeverOpen
                        var lever = (jsonData[i].parent.length - ParentLength) / settings.MaPClength + 1;
                        if (lever <= settings.LeverOpen)
                            jsonData[i].state.opened = true;
                        else jsonData[i].state.opened = false;
                        //Đặt icon cho các lever được đặt icon
                        if ((lever - 1) < settings.lstIcon.length)
                            jsonData[i].icon = true;
                        if (settings.LeverOpen == 0)
                            jsonData[i].state.opened = true;
                    }
                }
            }*/
            if (settings.SortByMAPC) {
                for (var i = jsonData.length - 1; i >= 0; i--) {
                    var MaPCCha = jsonData[i].parent.substring(0, jsonData[i].parent.length - settings.MaPClength);
                    //jQuery.map:
                    jsonData[i].parent = "#";
                    for (var j = i - 1; j >= 0; j--) {
                        if (jsonData[j].parent == MaPCCha) {
                            jsonData[i].parent = jsonData[j].id;
                            break;
                        }
                    }
                }
            }
            var myTree = $(treeBox).jstree({
                "core": {
                    "initially_open": ["1"],
                    "data": jsonData,
                    "check_callback": true,
                    "themes": {
                        "variant": settings.KhoangCachNode,
                        "theme": settings.Theme,
                        "dots": settings.HienDauCham,
                        "icons": settings.HienIcon
                    }
                },
                "search": {
                    "show_only_matches": settings.ChiHienKetQua,
                    "show_only_matches_children": true
                },
                "contextmenu": {
                    "items": settings.onContext
                },
                "plugins": settings.lstPlugin
            });
            if (settings.MoTatCa) myTree.jstree('open_all');
            //Sự kiện khi chọn node
            myTree.bind("select_node.jstree", settings.onchange);
            //Sự kiện load tree khi bấm vào node
            if(settings.LoadOnLever>0)
                myTree.bind("select_node.jstree", settings.onLoadTree);
            //Sự kiện khi kéo thả node
            myTree.bind("move_node.jstree", settings.onMove);
            //Sự kiện khi load xong tree
            myTree.bind("ready.jstree", settings.onReady);

            myTree.on('search.jstree', function (nodes, str, res) {
                if (str.nodes.length===0) {
                    treeBox.hide();
                }
            });

            var to = false;
            //Sự kiện khi tìm kiếm
            $("#" + settings.TreeName + settings.IDSearchBox).keyup(function () {
                treeBox.show();
                if (to) { clearTimeout(to); }
                to = setTimeout(function () {
                    var v = $("#" + settings.TreeName + settings.IDSearchBox).val().trim();
                    treeBox.jstree(true).search(v);
                }, 250);
            });
            $("#" + settings.TreeName + "collapse").click(function () {
                TreeOpenToLever(settings.TreeName + "DivTreeView",settings.LeverOpen);
            });
            $("#" + settings.TreeName + "expand").click(function () {
                myTree.jstree('open_all');
            });
            this.treeName = settings.TreeName;
            this.treeBox = treeBox;
            this.ItemID = settings.ItemIDName;
            this.AddedNode = null;
            return this;
        },
        //Dùng để xóa 1 hoặc 1 list node vào tree
        delete_node: function(jsNode){
            $(this).jstree("delete_node", jsNode);
        },
        //Dùng để thêm 1 hoặc 1 list node vào tree
        add_node: function(parent, newNode, position,  callback, is_loaded){
            $(this).jstree("create_node", parent, newNode, position, callback, is_loaded);
        },
        deselect_all: function () {
            $(this.treeBox).jstree('deselect_all');
        },
        saveNew: function (strNewName) {
            $(this.treeBox).jstree(true).select_node($("input:hidden[name=" + this.ItemID + "]").val());
            $(this.treeBox).jstree('select_node', $("input:hidden[name=" + this.ItemID + "]").val());
            $.jstree.reference(this.treeBox).select_node($("input:hidden[name=" + this.ItemID + "]").val());
            this.SMTree('jstreeUpdate', strNewName);
            this.SMTree('deselect_all');
            LoadNull();
        },
        loadtree: function (settings) {
            var settings = $.extend({
                imgLoadingUrl: '/images/ajax-loader.gif'
            });
            var imageLoading = '<div class="img-loading" style=\"font:12px Arial; width:100%; margin:0 auto; padding:10px 0px;\"><img src="'
                                + settings.imgLoadingUrl + '"  /><span>Đang tải dữ liệu...</span></div>';
            $(this.treeBox).html(imageLoading);
            //load tree
            $.post(urlGrid, function (data) {
                $(this.treeBox).html(data);
            });
        },
        //chọn node
        jstreeSave: function (NewName) {
            $(this.treeBox).jstree(true).select_node($("input:hidden[name=" + this.ItemID + "]").val());
            $(this.treeBox).jstree('select_node', $("input:hidden[name=" + this.ItemID + "]").val());
            $.jstree.reference(this.treeBox).select_node($("input:hidden[name=" + this.ItemID + "]").val());
            objTree.SMTree('jstreeUpdate', NewName);
        },
        jstreeDelete: function () {
            var id = $("input:hidden[name=" + this.ItemID + "]").val();
            $(this.treeBox).jstree("delete_node", "#" + id);
        },
        jstreeUpdate: function (NewName) {
            var id = $("input:hidden[name=" + this.ItemID + "]").val();
            $(this.treeBox).jstree('set_text', "#" + id, NewName);
        }
    };

    $.fn.SMTree = function (methodOrOptions) {
        if (lstMethods[methodOrOptions]) {
            return lstMethods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return lstMethods.init.apply(this, arguments);
        } else {
            $.error('Phương thức ' + methodOrOptions + ' không tồn tại!!!');
        }
    };
} (jQuery));

function TreeOpenToLever(divTreeView,LeverOpen){
    $("#" + divTreeView + " li[role='treeitem']").each(function () {
        var nodeId = $(this).attr("id");
        if ($(this).attr("aria-level") == LeverOpen) myTree.jstree("close_node", "#" + nodeId);
    });
}