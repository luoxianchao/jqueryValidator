/**
* jQuery Validator Plugin
*
* @copyright    2014 Rain Lee <raincious@gmail.com>
* @author       Rain Lee <raincious@gmail.com>
* @package      jQuery.validator
* @version      0.1.0 alpha
*
* Copyright (c) 2014, Rain Lee
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the documentation
*    and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
* The views and conclusions contained in the software and documentation are those
* of the authors and should not be interpreted as representing official policies,
* either expressed or implied, of the FreeBSD Project.
*
*/

(function($){
    var Validator = function(form, options) {
        var inited = false;

        var self = this;
        var formSubmitting = false;

        self.onSubmit = function(form) { return true; };
        self.onSubmitEnable = function(enabled) { return true; };

        self.onWait = self.onPassed = self.onError = function(object) {};

        self.data = {
            lastErrPos: {},
        };

        var status = {
            WAIT: 1, PASSED: 2, INVALID: 3, VERIFY: 4, GET: 5, TEST: 6, TOUCH: 7
        };

        var setting = {
            unsubmitableCss: '',
            submittingCSS: '',
            resubmitCSS: '',
            submitTimeout: 120000,
            formats: {},
            inputs: [],
            binds: {},
            methods: {
                length: function(val, max, min) {
                    if ((!max || val.length <= max) && (!min || val.length >= min)) {
                        return true;
                    }
                },
                compare: function(val, max, min) {
                    if ((!max || val <= max) && (!min || val >= min)) {
                        return true;
                    }
                },
                equal: function(val, max) {
                    objVal = $(max).val();

                    if (objVal && objVal == val) {
                        return true;
                    }
                }
            },
            events: {
                Wait: self.onWait,
                Passed: self.onPassed,
                Errored: self.onError
            }
        };

        var init = function() {
            if (inited) {
                log('Inited, cannot reinit');

                return false;
            }

            if (typeof form === 'undefined') {
                log('Form must be specified');

                return false;
            }

            if (!form.is('form')) {
                log('Target not a form');

                return false;
            }

            if (typeof options === 'undefined') {
                log('Option must be defined');

                return false;
            }

            if (typeof options.UnsubmitableCSS !== 'undefined') {
                setting.unsubmitableCss = options.UnsubmitableCSS;
            }

            if (typeof options.submittingCSS !== 'undefined') {
                setting.submittingCSS = options.submittingCSS;
            }

            if (typeof options.resubmitCSS !== 'undefined') {
                setting.resubmitCSS = options.resubmitCSS;
            }

            if (typeof options.submitTimeout === 'number' && !isNaN(options.submitTimeout)) {
                setting.submitTimeout = parseInt(options.submitTimeout,  10);
            }

            if (typeof options.Format === 'object' && options.Format) {
                setting.formats = options.Format;

                for (var f in options.Format) {
                    if (typeof options.Format[f] === 'string') {
                        if (!(setting.formats[f] = convertPreg(options.Format[f]))) {
                            log('Format not valid: ' + options.Format[f]);
                        }
                    } else {
                        log('Format not a string: ' + options.Format[f]);
                    }
                }
            }

            if (typeof options.Events === 'object' && options.Events) {
                for (var f in options.Events) {
                    if (typeof options.Events[f] === 'function') {
                        setting.events[f] = options.Events[f];
                    } else {
                        log('Event ' + f + ' not a closure, ignoring');
                    }
                }
            }

            if (typeof options.Methods === 'object' && options.Methods) {
                for (var f in options.Methods) {
                    if (typeof options.Methods[f] === 'function') {
                        setting.methods[f] = options.Methods[f];
                    } else {
                        log('Method ' + f + ' not a closure, ignoring');
                    }
                }
            }

            if (typeof options.Binds === 'object' && options.Binds) {
                for (var f in options.Binds) {
                    if (typeof options.Binds[f] === 'function') {
                        setting.binds[f] = options.Binds[f];
                    } else {
                        log('Bind ' + f + ' not a closure');

                        return false;
                    }
                }
            }

            if (typeof options.topOffset !== 'undefined') {
                setting.topOffset = parseInt(options.topOffset, 10);
            } else {
                setting.topOffset = 50;
            }

            if (typeof options.textAreaAutoExpand === 'undefined' || options.textAreaAutoExpand === false) {
                /* Idea from: http://www.jacklmoore.com/autosize and http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/ */
                (function() {
                    var refer = $('<div></div>');
                    var referCSS = [
                        'width',
                        'minHeight',
                        'fontFamily',
                        'fontSize',
                        'textIndent',
                        'whiteSpace',
                        'textTransform',
                        'letterSpacing',
                        'fontStyle',
                        'wordSpacing',
                        'fontWeight',
                        'lineHeight',
                        'wordWrap'
                    ];

                    refer.css({
                        'zoom': '1',
                        'wordBreak': 'break-all',
                        'display': 'none',
                        'whiteSpace': 'pre-wrap'
                    });

                    $('body').append(refer);

                    var autoExpandTextArea = function(obj, config, recheck) {
                        var toHeight = 0;

                        for (var p in referCSS) {
                            refer.css(
                                referCSS[p],
                                obj.css(referCSS[p])
                            );
                        }

                        refer.text(
                            obj.val() + "\r\n"
                        );

                        refer.html(
                            refer.html().replace(/\n/g, '<br />')
                        );

                        toHeight = refer.height();

                        if (config.min && toHeight < config.min) {
                            toHeight = config.min;

                            obj.css('overflowY', '');
                        } else if (config.max && toHeight > config.max) {
                            toHeight = config.max;

                            obj.css('overflowY', '');
                        } else {
                            obj.css('overflowY', 'hidden');
                        }

                        obj.height(toHeight);

                        if (recheck) {
                            setTimeout(function() {
                                if (obj.height() != toHeight) {
                                    autoExpandTextArea(obj, config, false);
                                }
                            }, 10);
                        }
                    };

                    var getHeightFromCSS = function(value) {
                        refer.css('width', value); // width will be reseted by autoExpandTextArea

                        return refer.width();
                    };

                    form.find($('textarea')).each(function() {
                        var obj = $(this);
                        var setting = {
                            min: obj.data('validator-textarea-expand-min') || obj.data('va-tah-min') || getHeightFromCSS(obj.css('minHeight')) || obj.height(),
                            max: obj.data('validator-textarea-expand-max') || obj.data('va-tah-max') || getHeightFromCSS(obj.css('maxHeight')) || obj.height()
                        };
                        var delaying = false;

                        if (setting.min == setting.max) {
                            return;
                        }

                        var resizer = function() {
                            autoExpandTextArea(obj, setting, true);
                        };

                        var delayResizer = function() {
                            if (delaying) {
                                return;
                            }

                            delaying = true;

                            setTimeout(function() {
                                resizer();
                                delaying = false;
                            }, 5);
                        };

                        obj.bind('input propertychange keyup change focus blur', resizer);

                        $(window).resize(delayResizer);

                        resizer();
                    });
                })();
            }

            form.find('input,textarea,select,button').each(function() {
                var inputer = $(this);

                var setCSSWrong = function() {},
                    dismissCSSWrong = function() {},
                    setCSSWorking = function() {},
                    dismissCSSWorking = function() {},
                    setMSG = function(msg) {},
                    setMSGWrong = function() {},
                    dismissMSGWrong = function() {};

                var v_data = {
                    Max: inputer.data('validator-maxlength') || inputer.data('va-max') || 0,
                    Min: inputer.data('validator-minlength') || inputer.data('va-min') || 0,
                    Type: inputer.data('validator-type') || inputer.data('va-type') || '',
                    Method: inputer.data('validator-method') || inputer.data('va-method') || 'length',
                    Resulter: inputer.data('validator-resulter') || inputer.data('va-show') || '',
                    ClickBind: inputer.data('validator-click') || inputer.data('va-click') || '',
                    FocusCSS: inputer.data('validator-focus') || inputer.data('va-focus') || 'focused',
                    WrongCSS: inputer.data('validator-wrong') || inputer.data('va-error') || '',
                    WorkingCSS: inputer.data('validator-working') || inputer.data('va-working') || '',
                    msgResulter: inputer.data('validator-messager') || inputer.data('va-msgr') || '',
                    WrongMSG: inputer.data('validator-message') || inputer.data('va-msg') || '',
                    hook: function(value, resultCall) { return status.PASSED; },
                    setWrong: function() {},
                    dismissWrong: function() {},
                    setWorking: function() {},
                    dismissWorking: function() {},
                    validated: function(validated) {}
                };

                if (v_data.Resulter) {
                    v_data.ResulterObj = $(v_data.Resulter);
                }

                if (v_data.msgResulter) {
                    v_data.msgResulterObj = $(v_data.msgResulter);
                }

                if (typeof v_data.ResulterObj === 'object' && v_data.ResulterObj) {
                    setCSSWrong = function() {
                        v_data.ResulterObj.addClass(v_data.WrongCSS);
                    };

                    dismissCSSWrong = function() {
                        v_data.ResulterObj.removeClass(v_data.WrongCSS);
                    };

                    setCSSWorking = function() {
                        v_data.ResulterObj.addClass(v_data.WorkingCSS);
                    };

                    dismissCSSWorking = function() {
                        v_data.ResulterObj.removeClass(v_data.WorkingCSS);
                    };

                    inputer.focus(function() {
                        v_data.ResulterObj.addClass(v_data.FocusCSS);
                    });

                    inputer.blur(function() {
                        v_data.ResulterObj.removeClass(v_data.FocusCSS);
                    });

                    if (v_data.ClickBind != "no") {
                        v_data.ResulterObj.click(function() {
                            inputer.focus();
                        });
                    }
                }

                if (typeof v_data.msgResulterObj === 'object' && v_data.msgResulterObj) {
                    var msgBackup = v_data.msgResulterObj.text();

                    setMSG = function(msg) {
                        if (msg) {
                            v_data.msgResulterObj.text(msg);
                        } else {
                            v_data.msgResulterObj.text(msgBackup);
                        }
                    };

                    setMSGWrong = function() {
                        setMSG(v_data.WrongMSG.replace('{max}', v_data.Max).replace('{min}', v_data.Min));
                    };

                    dismissMSGWrong = function() {
                        v_data.msgResulterObj.text(msgBackup);
                    };
                }

                for (var b in setting.binds) {
                    if (inputer.is($(b))) {
                        v_data.hook = setting.binds[b];
                        break;
                    }
                }

                inputer.message = setMSG;

                inputer.validate = function(validated) {
                    switch(validated) {
                        case status.GET:
                            if (typeof inputer['validated'] === 'undefined') {
                                return (inputer['validated'] = inputer.validate(status.VERIFY));
                            }

                            return inputer['validated'];
                            break;

                        case status.TOUCH:
                            if (typeof inputer['validated'] === 'undefined') {
                                return inputer.validate(status.TEST);
                            }

                            return inputer['validated'];
                            break;

                        case status.VERIFY:
                            if (verify(inputer.val(), v_data.Max, v_data.Min, v_data.Type, v_data.Method)) {
                                return inputer.validate(status.PASSED);
                            } else {
                                return inputer.validate(status.INVALID);
                            }
                            break;

                        case status.TEST:
                            if (verify(inputer.val(), v_data.Max, v_data.Min, v_data.Type, v_data.Method)) {
                                return status.PASSED;
                            } else {
                                return status.INVALID;
                            }
                            break;

                        default:
                            inputer['validated'] = validated;

                            switch(validated) {
                                case status.WAIT:
                                    setCSSWorking();
                                    setting.events.Wait(inputer);
                                    enableSubmit(false);
                                    break;

                                case status.PASSED:
                                    dismissCSSWrong();
                                    dismissMSGWrong();
                                    dismissCSSWorking();
                                    setting.events.Passed(inputer);
                                    checkSubmitable(status.TOUCH);
                                    break;

                                case status.INVALID:
                                    setCSSWrong();
                                    setMSGWrong();
                                    dismissCSSWorking();
                                    setting.events.Errored(inputer);
                                    enableSubmit(false);
                                    break;
                            }

                            return validated;
                            break;
                    }
                };

                var v_hook = function() {
                    inputer.validate(status.WAIT);

                    return v_data.hook(
                        inputer,
                        function(successed) {
                            if (successed) {
                                if (inputer.validate(status.TEST) === status.PASSED) {
                                    inputer.validate(status.PASSED);

                                    return true;
                                } else {
                                    inputer.validate(status.INVALID);
                                }
                            } else {
                                inputer.validate(status.INVALID);
                            }

                            return false;
                        }
                    );
                };

                var v_check = function() {
                    var old = inputer.val();

                    if (inputer['validate-old'] !== old) {
                        inputer['validate-old'] = old;

                        if (inputer.validate(status.VERIFY) === status.PASSED) {
                            switch(v_hook()) {
                                case status.PASSED:
                                    return inputer.validate(status.PASSED);

                                case status.INVALID:
                                    return inputer.validate(status.PASSED);
                            }
                        }
                    }
                };

                var v_test = function() {
                    if (inputer['validate-tested'] !== true && inputer.validate(status.TEST) === status.PASSED) {
                        inputer['validate-tested'] = true;
                    }

                    if (inputer['validate-tested'] === true) {
                        return v_check();
                    }
                };

                inputer.change(v_check);

                inputer.focus(function () {
                    if (inputer.val()) {
                        v_test();
                    }
                });

                inputer.keyup(function () {
                    if (typeof inputer.checkTimer !== 'undefined') {
                        clearTimeout(inputer.checkTimer);
                    }

                    inputer.checkTimer = setTimeout(function() {
                        v_test();
                    }, 150);
                });

                inputer.validator = v_data;

                setting.inputs.push(inputer);
            });

            checkSubmitable(status.TEST);

            form.submit(function(event) {
                var submitable = false;

                if (checkAll()) {
                    if (self.onSubmit(form) && !formSubmitting) {
                        formSubmitting = true;

                        if (setting.submittingCSS) {
                            if (setting.resubmitCSS && form.hasClass(setting.resubmitCSS)) {
                                form.removeClass(setting.resubmitCSS);
                            }

                            form.addClass(setting.submittingCSS);

                            setTimeout(function() {
                                form.removeClass(setting.submittingCSS);

                                if (setting.resubmitCSS) {
                                    form.addClass(setting.resubmitCSS);
                                }

                                formSubmitting = false;
                            }, setting.submitTimeout);
                        }

                        return true;
                    }
                }

                if (typeof self.data.lastErrPos.top !== 'undefined') {
                    $('html, body').animate({ scrollTop: self.data.lastErrPos.top - setting.topOffset }, 1000);
                }

                return false;
            });

            inited = true;

            return true;
        };

        var convertPreg = function(string) {
            string = string.replace(/\{/g, '').replace(/\}/g, '').replace(/\\x/g, '\\u').match('/(.*)/');

            if (string != null) {
                return string[1];
            }

            return false;
        };

        var log = function(message) {
            if (typeof console != undefined) {
                console.log('[Validator] validator stopped due to a problem: ' + message + '.');
            }
        };

        var enableSubmit = function(submitable) {
            if (setting.unsubmitableCss) {
                if (!submitable) {
                    form.addClass(setting.unsubmitableCss);
                } else {
                    form.removeClass(setting.unsubmitableCss);
                }
            }

            self.onSubmitEnable(submitable);
        }

        var checkSubmitable = function(statusMethod) {
            submitable = false;

            if (touchAll(statusMethod)) {
                submitable = true;
            } else {
                submitable = false;
            }

            enableSubmit(submitable);
        };

        var touchAll = function(statusMethod) {
            result = true;

            for (var p in setting.inputs) {
                if (setting.inputs[p].validate(statusMethod) !== status.PASSED) {
                    result = false;
                }
            }

            return result;
        };

        var checkAll = function() {
            var result = true;
            var passed = false;

            for (var p in setting.inputs) {
                if (setting.inputs[p].validate(status.GET) != status.PASSED) {
                    if (result) {
                        self.data.lastErrPos = setting.inputs[p].offset();
                    }

                    result = false;
                }
            }

            if (result) {
                self.data.lastErrPos = {};
            }

            return result;
        };

        var verify = function(val, max, min, type, method) {
            if (typeof val === 'string') {
                if (type) {
                    if (typeof setting.formats[type] === 'string') {
                        if (!val.match(setting.formats[type])) {
                            return false;
                        }
                    } else {
                        log('Format ' + type + ' not found.');

                        return false;
                    }
                }

                if (method) {
                    if (typeof setting.methods[method] === 'function') {
                        if (!setting.methods[method](val, max, min)) {
                            return false;
                        }
                    } else {
                        log('Method ' + method + ' not found.');

                        return false;
                    }
                }

                return true;
            }
        };

        return init();
    };

    $.fn.validator = function(options) {
        var v = new Validator(this, options);

        return v;
    };
})(jQuery);
