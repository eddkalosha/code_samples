(function ($) {
    "use strict";

    var TABLE_DEFAULTS = $.fn.bootstrapTable.defaults,
        COLUMN_DEFAULTS = $.fn.bootstrapTable.columnDefaults;

    function getQueryParams(params) {
        var sortNames = this.columns[0]
                .filter(function (col) {
                    return col.field === params.sortName;
                })
                .map(function (col) {
                    return col.sortName;
                }),
            sortName = (sortNames.length ? sortNames[0] : undefined);
        return {
            action_in: this.dataAction,
            web_form_item_id: this.webFormItemIdValue,
            viewMode: this.viewMode,
            rows: params.pageSize,
            page: params.pageNumber,
            sidx: sortName || 'SORTCOLUNDEF',
            sord: params.sortOrder || 'asc'
        };
    }

    function parseXml(node) {
        var object = {},
            attrs = node.attributes,
            items = node.childNodes,
            attr = null,
            item = null;
        if (!(attrs && attrs.length) && !(items && items.length)) {
            return undefined;
        }
        if (attrs) {
            for (var idx = attrs.length - 1; idx >= 0; --idx) {
                attr = attrs.item(idx);
                object[attr.name] = attr.value;
            }
        }
        if (items) {
            for (var idx = 0; idx < items.length; ++idx) {
                item = items.item(idx);
                if (item.nodeType === 3) {
                    object["#text"] = (object["#text"] || "") + item.wholeText;
                } else if (item.nodeType === 1) {
                    if (object[item.nodeName]) {
                        if (!object[item.nodeName].push) {
                            object[item.nodeName] = [object[item.nodeName]];
                        }
                        object[item.nodeName].push(parseXml(item));
                    } else {
                        object[item.nodeName] = parseXml(item);
                    }
                }
            }
        }

        return Object.keys(object).length === 1 && object["#text"] ? object["#text"] : object;
    }

    function receiveXml(xml) {
        if (xml) {
            var json = parseXml(xml),
                columns = this.columns[0].field ? this.columns : this.columns[0],
                result = {};
            json = json || {};
            json.rows = json.rows || {};
            json.rows.row = json.rows.row || {};
            if (!json.rows.row.length) {
                json.rows.row = [json.rows.row];
            }
            result.rows = json.rows.row.map(function (row) {
                var res = {},
                    arr = row.cell;
                for (var idx = 0; idx < arr.length; ++idx) {
                    try {
                        if (columns && columns[idx] && columns[idx].field) {
                            res[columns[idx].field] = arr[idx];
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
                res.id = row.id;
                return res;
            });
            result.total = json.rows.records;
            return result;
        }
        return {
            total: 0,
            rows: []
        }
    }

    function getRowStyle(row) {
        var classes = [];
        if (row[this.nodeKeyField] == this.nodeKeyValue) {
            classes.push(this.nodeKeyHighlightClass);
        }
        return {
            classes: classes.join(' ')
        };
    }

    function onClickRow(row) {
        if (this.clickable) {
            submitFormWithParams({
                action_in: 'SET_LIST',
                form_type_in: 'R',
                node_key_in: row[this.nodeKeyField],
                disp_val_in: row[this.nodeNameField] || ""
            });
        }
    }

    function getEditLink(value, row) {
        return "admin.jsp"
            + "?name=" + (row[this.options.nodeNameField] || "")
            + "&key=" + (row[this.options.nodeKeyField] || "")
            + "&mode=U";
    }

    function getDeleteLink() {
        // unsafe operation
        return '#';
    }

    const SUBMENU = jQuery.parseHTML(`
        <div class="menu">
            <ul class="submenu">
                <li><a>Item1</a></li>
                <li><a>Long Item1 Item1Long Item1 Item1Long Item1 Item1Long Item1 Item1</a></li>
                <li><a>LONGITEMONELINELONGITEMONELINELONGIT</a></li>
                <li><a>Long Item1</a></li>
                <li><a href='http://google.com'>Link to Google.com</a></li>
            </ul>
        </div>
    `)[1] ;

    function getActionsFormatter() {
        var widget = this;
        const {submenu,editable,deletable} = this.options;
        return function (value, row, index) {
            var buff = [];
            buff.push("<ul>");
            if (submenu.show) {
                buff.push(`<li class="grid-submenu" data-action='submenu'>
                <a class="menu-btn" href='javascript:void(0);'>
                    <i class='fa fa-bars' aria-hidden='true'></i>
                </a>
                </li>`);
            }
            if (editable) {
                buff.push("<li data-action='edit'>");
                buff.push("<a href='");
                buff.push(getEditLink.apply(widget, arguments));
                buff.push("'>Edit</a>");
                buff.push("</li>");
            }
            if (deletable) {
                buff.push("<li data-action='delete'>");
                buff.push("<a href='");
                buff.push(getDeleteLink.apply(widget, arguments));
                buff.push("'>Del</a>");
                buff.push("</li>");
            }
            buff.push("</ul>");
            return buff.join('');
        }
    }

    function getTreeFormatter(formatter) {
        var widget = this,
            treeLevelField = this.options.treeLevelField,
            treeLeafField = this.options.treeLeafField,
            treeOpenField = this.options.treeOpenField;
        return function (value, row, index) {
            var buff = [],
                level = row[treeLevelField],
                isLeaf = row[treeLeafField] == "true",
                isOpen = row[treeOpenField] == "true";
            if (widget.options.viewMode === 'tree') {
                buff.push("<ul>");
                while (level && level > 1) {
                    buff.push("<li data-tree-role='indent'/>");
                    level = level - 1;
                }
                buff.push("<li ");
                if (isLeaf) {
                    buff.push("data-tree-role='leaf'");
                } else {
                    buff.push("data-tree-role='node' data-tree-state=");
                    buff.push(isOpen ? "'open'" : "'closed'");
                }
                buff.push(">");
                buff.push(formatter ? formatter.apply(this, arguments) : value);
                buff.push("</li>");
                buff.push("</ul>");
            } else {
                buff.push(formatter ? formatter.apply(this, arguments) : value);
            }
            return buff.join('');
        }
    }

    /**
     * BootstrapTable is not a jquery ui widget.
     * So we need to wrap it because it cannot be extended.
     */
    $.widget("brm.brmgrid", {
        // reasonable defaults
        options: $.extend({}, TABLE_DEFAULTS, {
            ajax: $.ajax,
            submit: submitFormWithParams,
            url: 'http://www.mocky.io/v2/5d08a9b034000039005d9915',//'listDataSource',
            dataType: 'xml',
            dataAction: 'list',
            columns: [],
            idField: 'id',
            nodeKeyField: 'id',
            nodeNameField: false,
            nodeKeyValue: false,
            webFormItemIdValue: false,
            nodeKeyHighlightClass: 'bootstrap-table-highlight',
            viewMode: 'list',
            treeField: false,
            treeLeafField: 'leaf',
            treeLevelField: 'level',
            treeOpenField: 'open',
            treeParentField: 'parent',
            editable: true,
            deletable: true,
            actionsField: false,
            clickable: true,
            clickableClass: '',
            unclickableClass: 'bootstrap-table-unclickable',
            pagination: true,
            paginationLoop: false,
            sidePagination: 'server',
            paginationHAlign: 'left',
            paginationDetailHAlign: 'right',
            queryParamsType: false,
            queryParams: getQueryParams,
            responseHandler: receiveXml,
            submenu:{
                show:true,
                isOpen:false,
                displayNode:-1
            },
            rowStyle: getRowStyle,
            onClickRow: onClickRow
        }),

        _create: function () {
            console.log("CREATE Table opt -- ",this.options);
            this._extendWithDataAttrs(this.options, this.options, this.element);

            this._createDialog();
            this._createRoutes();
            this._createColumns();
            this._createTreeColumn();
            this._createActionsColumn();

            this._createTable();
        },

        _createDialog: function () {
            this.element.brmdialog();
        },

        _createRoutes: function () {
            this.route('load', ['ajaxLoad', 'doLoad']);
            this.route('toggleMenu', ['toggleSubMenu']);
            this.route('click', ['checkClickable', 'doClick']);
            this.route('edit', ['loading', 'checkEditable', 'doEdit']);
            this.route('delete', ['loading', 'checkDeletable', 'confirmDelete', 'doDelete', 'applyDelete']);
            this.route('openNode', ['loading', 'doOpenNode', 'applyOpenNode']);
            this.route('closeNode', ['loading', 'doCloseNode', 'applyCloseNode']);
            this.route('closeAllNodes', ['loading', 'doCloseAllNodes', 'applyCloseAllNodes']);
        },

        _createColumns: function () {
            var self = this;
            if (!this.options.columns || !this.options.columns.length) {
                this.options.columns = [];
                this.element.find('col').each(function () {
                    self.options.columns.push(self._extendWithDataAttrs({}, COLUMN_DEFAULTS, $(this)));
                });
            }
        },

        _createTreeColumn: function () {
            var widget = this,
                columns = this.options.columns,
                treeField = this.options.treeField,
                treeColumn;
            if (treeField) {
                treeColumn = columns.filter(function (col) {
                    return col.field === treeField;
                });
            }
            if (treeColumn && treeColumn.length) {
                treeColumn = treeColumn[0];
                treeColumn.formatter = getTreeFormatter.call(this, treeColumn.formatter);
                treeColumn.events = $.extend({}, {
                    'click [data-tree-role="node"]': function (event, value, row, index) {
                        var isOpen = row[widget.options.treeOpenField] == 'true',
                            state = isOpen ? 'open' : 'closed',
                            newState = isOpen ? 'closed' : 'open';

                        row[widget.options.treeOpenField] = '' + !isOpen;
                        $(event.target).data('tree-state', newState);

                        if ('open' === newState) {
                            widget.openNode({index: index, row: row});
                        } else {
                            widget.closeNode({index: index, row: row});
                        }

                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                }, treeColumn.events);
            }
        },

        _createActionsColumn: function () {
            var widget = this,
                columns = this.options.columns,
                editable = this.options.editable,
                deletable = this.options.deletable,
                actionsField = this.options.actionsField,
                actionsColumn;
            if ((editable || deletable) && actionsField) {
                actionsColumn = columns.filter(function (col) {
                    return col.field === actionsField;
                });
            }
            if (actionsColumn && actionsColumn.length) {
                actionsColumn = actionsColumn[0];
                actionsColumn.formatter = getActionsFormatter.call(this, actionsColumn.formatter);
                actionsColumn.events = $.extend({}, {
                    'click [data-action="submenu"] a': (e, value, row) => {
                        widget.toggleMenu({e,value,row});
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    },
                    'click [data-action="edit"] a': function (event, value, row) {
                        widget.edit({row: row});
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    },
                    'click [data-action="delete"] a': function (event, value, row) {
                        widget.delete({row: row});
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                }, actionsColumn.events);
            }
        },

        _createTable: function () {
            var widget = this;
            console.log(" this options ajax create table", this.options.ajax, this.load, this.options);
            this._bootstrapTable($.extend({}, this.options, {
                ajax: (this.options.ajax === $.ajax ? this.load : this.options.ajax),
                classes: (this.options.clickable
                    ? this.options.classes + " " + this.options.clickableClass
                    : this.options.classes + " " + this.options.unclickableClass),
                onClickRow: function (row) {
                    if (widget.options.onSelectRow) {
                        widget.options.onSelectRow(row.Id,row,row);
                    } else {
                        widget.click({row: row});
                    }
                }
            }));
        },

        getData: function () {
            return this._bootstrapTable('data');
        },

        setData: function (data) {
            return this._bootstrapTable('load', data)
        },

        hideActionsColumn: function () {
            if (this.options.actionsField) {
                this._bootstrapTable('hideColumn', this.options.actionsField);
            }
        },

        _pipeline: function (steps) {
            var widget = this,
                callNext = (function (func, next) {
                    return function (req) {
                        if (!arguments.length) {
                            req = {};
                        }
                        return func.call(widget, req, next);
                    }
                }),
                next = (function (req) {
                    return widget._resolved(req);
                });
            for (var idx = steps.length - 1; idx >= 0; --idx) {
                next = callNext.call(widget, widget[steps[idx]], next);
            }
            return next;
        },

        _resolved: function (data) {
            return $.Deferred().resolve(data);
        },

        _rejected: function (data) {
            return $.Deferred().reject(data);
        },

        route: function (name, steps) {
            this._routes = this._routes || {};
            if (steps) {
                this._routes[name] = steps;
                this[name] = this._pipeline(steps);
            } else {
                return this._routes[name];
            }
        },

        ajax: function (req) {
            var ajaxReq = $.extend({
                    type: this.options.method,
                    url: this.options.url,
                    crossDomain:true,
                    contentType: this.options.contentType,
                    dataType: this.options.dataType
                }, this.options.ajaxOptions),
                ajaxPromise = $.Deferred();
            if (req.data) {
                ajaxReq = $.extend(ajaxReq, req);
            } else {
                ajaxReq.data = req;
            }
            ajaxReq.success = function (resp) {
                ajaxPromise.resolve(resp);
            };
            ajaxReq.error = function (resp) {
                ajaxPromise.reject(resp);
            };
            this.options.ajax(ajaxReq);
            return ajaxPromise;
        },

        submit: function (req) {
            this.options.submit(req);
            return this._resolved();
        },

        loading: function (req, next) {
            $('*').css('cursor', 'wait');
            return next(req).always(function () {
                $('*').css('cursor', '');
            });
        },

        showLoading: function () {
            this._bootstrapTable('showLoading');
        },

        hideLoading: function () {
            this._bootstrapTable('hideLoading');
        },

        ajaxLoad: function (req, next) {
            var widget = this,
                successCallback = req.success,
                errorCallback = req.error;
            return next(req).then(function (resp) {
                successCallback(resp);
                return widget._resolved(resp);
            }, function (resp) {
                errorCallback(resp);
                return widget._rejected(resp);
            })
        },

        doLoad: function (req, next) {
            return this.ajax(req).then(function (resp) {
                return next(resp);
            })
        },
        toggleSubMenu: function(req,next){
            /**
             * @author Edd Kalosha
             * @description: function for toggle submenu in Grid (@override widget.options object (@field submenu))
             * @param req @type {Object} include input parameters (@param e(event),@param row, @param value)  (part of next.js)
             * @param next (part of next.js)
             * @var SUBMENU @type {DOM Node} @global object for test
             * @returns @function next(@param {Object} req) || @function this._rejected(@param {Object} error)
             */
         let {submenu:tmp_submenu} =this.options;
         const node = req.e.currentTarget.parentElement; /** @type {DOM Node} */
         const nodeKey = req.row[this.options.nodeKeyField]; /** @type {Text} */
         //detect if click was on the same button (for menu close)
         const isPrevNode = tmp_submenu.displayNode===nodeKey; 
         const isOpen = isPrevNode? !tmp_submenu.isOpen:true;
         const menuBtnClass = 'menu-btn'; const menuOpenClass = 'menu-btn-open';
         tmp_submenu = {
             show:tmp_submenu.show,
             isOpen,
             displayNode: nodeKey
            };
         this.options.submenu = tmp_submenu;  
         try{
             //remove all active menuButtons
            [].forEach.call(
                document.querySelectorAll(`.${menuBtnClass}.${menuOpenClass}`), 
                el=>el.classList.remove(menuOpenClass));  
            if (isOpen) { //if menu opened
                node.appendChild(SUBMENU);
                const menuBtn = node.querySelector(`.${menuBtnClass}`);
            //apply active class 4 selected menuButton    
                if (menuBtn) menuBtn.classList.add(menuOpenClass)
            }else node.removeChild(SUBMENU); //if menu closed
            return next(req); 
         }catch(e) {console.error('grid.js > toggleSubMenu()',e);this._rejected({errSubMenu: e})}
        }, 
        checkClickable: function (req, next) {
            if (this.options.clickable) {
                return next(req);
            }
            return this._rejected({clickable: false});
        },

        doClick: function (req, next) {
            return this.submit({
                action_in: 'SET_LIST',
                form_type_in: 'R',
                node_key_in: req.row[this.options.nodeKeyField],
                disp_val_in: req.row[this.options.nodeNameField]
            }).then(function () {
                return next(req);
            });
        },

        checkEditable: function (req, next) {
            var widget = this;
            return this.ajax({
                dataType: 'json',
                data: {
                    action_in: 'edit_check',
                    rowId: req.row[this.options.nodeKeyField],
                    formType: 'U'
                }
            }).then(function (resp) {
                resp.editable = 'true' === resp.editable;
                if (resp.editable) {
                    return next(req);
                } else {
                    widget._dialog('warning', {message: resp.message});
                    return widget._rejected(resp);
                }
            });
        },

        doEdit: function (req, next) {
            return this.submit({
                action_in: 'SET_FORM_VIEW',
                form_type_in: 'U',
                node_key_in: req.row[this.options.nodeKeyField]
            }).then(function () {
                return next(req);
            });
        },

        confirmDelete: function (req, next) {
            var promise = $.Deferred();
            if (req.deletable) {
                this._dialog('confirm', {
                    title: 'Confirm',
                    message: jsMessageSource['admin.delete_record'],
                    callback: function (result) {
                        if (result) {
                            promise.resolve(req);
                        } else {
                            promise.reject(req);
                        }
                    }
                });
            } else {
                this._dialog('warning', {message: req.message});
                promise.reject(req);
            }
            return promise.then(function (arg) {
                return next(arg);
            });
        },

        checkDeletable: function (req, next) {
            return this.ajax({
                dataType: 'json',
                data: {
                    action_in: 'delete_check',
                    rowId: req.row[this.options.nodeKeyField]
                }
            }).then(function (resp) {
                return next($.extend(req, resp));
            });
        },

        doDelete: function (req, next) {
            return this.ajax({
                dataType: 'text',
                data: {
                    action_in: 'delete_records',
                    nodeKey: req.row[this.options.nodeKeyField],
                    nodeName: req.row[this.options.nodeNameField]
                }
            }).then(function () {
                return next(req);
            });
        },

        applyDelete: function (req, next) {
            this._bootstrapTable('refresh', {
                silent: true
            });
            return next(req);
        },

        doOpenNode: function (req, next) {
            return this.ajax({
                action_in: 'list',
                viewMode: this.options.viewMode,
                nodeid: req.row[this.options.nodeKeyField],
                parentid: req.row[this.options.treeParentField],
                n_level: req.row[this.options.treeLevelField]
            }).then(function (resp) {
                req.xml = resp;
                return next(req);
            });
        },

        applyOpenNode: function (req, next) {
            var widget = this,
                pos = req.index + 1,
                data = receiveXml.call(this.options, req.xml);
            data.rows.forEach(function (row) {
                widget._bootstrapTable('insertRow', {
                    index: pos,
                    row: row
                });
                pos = pos + 1;
            });
            return next(req);
        },

        doCloseNode: function (req, next) {
            return this.ajax({
                dataType: 'text',
                data: {
                    action_in: 'expandCollapseTreeNodeAction',
                    state: 'collapseNode',
                    nodeid: req.row[this.options.nodeKeyField]
                }
            }).then(function () {
                return next(req);
            });
        },

        applyCloseNode: function (req, next) {
            // var index = req.index,
            //     rows = this._bootstrapTable('getData'),
            //     values = [];
            // for (var idx = index + 1, len = rows.length, lvl = rows[index][this.options.treeLevelField];
            //      idx < len && rows[idx][this.options.treeLevelField] > lvl;
            //      ++idx) {
            //     values.push(rows[idx][this.options.nodeKeyField]);
            // }
            // this._bootstrapTable('remove', {
            //     field: this.options.nodeKeyField,
            //     values: values
            // });
            this._bootstrapTable('refresh', {silent: true});
            return next(req);
        },

        doCloseAllNodes: function (req, next) {
            return this.ajax({
                dataType: 'text',
                data: {
                    action_in: 'expandCollapseTreeNodeAction',
                    state: 'collapseAll',
                    nodeid: -1
                }
            }).then(function () {
                return next(req);
            });
        },
        refreshGrid : function (opt) {
            this.showLoading();
            try {
                if (opt) {
                    this._bootstrapTable('refresh', opt);
                } else {
                    this._bootstrapTable('refresh', {silent: true});
                }
            } finally {
                this.hideLoading();
            }
        },

        applyCloseAllNodes: function (req, next) {
            this._bootstrapTable('refresh', {silent: true});
            return next(req);
        },


        _extendWithDataAttrs: function (target, object, element) {
            return $.extend(target, object, Object.keys(object).reduce(function (accum, key) {
                accum[key] = element.data(key);
                return accum;
            }, {}));
        },

        _bootstrapTable: function () {
            return this.element.bootstrapTable.apply(this.element, arguments);
        },

        _dialog: function () {
            return this.element.brmdialog.apply(this.element, arguments);
        },

        _setOption: function (key, value) {
            this._super(key, value);
            this._bootstrapTable('refreshOptions', this.options);
        },

        _setOptions: function (options) {
            this._super(options);
            this._bootstrapTable('refreshOptions', this.options);
        },

        _destroy: function () {
            this._bootstrapTable('destroy');
            this._super();
        }
    });

})(jQuery);
