/*
* jQuery Validator Plugin
*
* @copyright	2013 Rain Lee <raincious@gmail.com>
* @author		Rain Lee <raincious@gmail.com>
* @package		jQuery.validator
* @version		0.0 prototype
* 
* Copyright (c) 2013, Rain Lee
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
		
		self.onSubmit = function(result) {};
		
		self.onWait = self.onPassed = self.onError = function(object) {};
		
		self.data = {
			lastErrPos: {},
		};
		
		var setting = {
			formats: null,
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
				}
			},
			events: {
				Wait: self.onWait,
				Passed: self.onPassed,
				Errored: self.onError
			}
		};
		
		var status = {
			WAIT: 1, PASSED: 2, INVALID: 3, VERIFY: 4, GET: 5, TEST: 6
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
			
			if (typeof options.Format === 'undefined') {
				log('Format not set');
				
				return false;
			} else {
				setting.formats = options.Format;
				
				for (var f in options.Format) {
					setting.formats[f] = convertPreg(options.Format[f]);
				}
			}
			
			if (typeof options.Events === 'object') {
				for (var f in options.Events) {
					if (typeof options.Events[f] === 'function') {
						setting.events[f] = options.Events[f];
					} else {
						log('Event ' + f + ' not a closure, ignoring');
					}
				}
			}
			
			if (typeof options.Methods === 'object') {
				for (var f in options.Methods) {
					if (typeof options.Methods[f] === 'function') {
						setting.methods[f] = options.Methods[f];
					} else {
						log('Method ' + f + ' not a closure, ignoring');
					}
				}
			}
			
			if (typeof options.Bind === 'object') {
				for (var f in options.Bind) {
					if (typeof options.Bind[f] === 'function') {
						setting.binds[f] = options.Bind[f];
					} else {
						log('Bind ' + f + ' not a closure');
						
						return false;
					}
				}
			}
			
			form.find('input,textarea,select,button').each(function() {
				var inputer = $(this);
				
				var setCSSWrong = function() {},
					dismissCSSWrong = function() {},
					setCSSWorking = function() {},
					dismissCSSWorking = function() {},
					setMSGWrong = function() {},
					dismissMSGWrong = function() {};
					
				var v_data = {
					Max: inputer.data('validator-maxlength') || inputer.data('va-max') || 0,
					Min: inputer.data('validator-minlength') || inputer.data('va-min') || 0,
					Type: inputer.data('validator-type') || inputer.data('va-type') || '',
					Method: inputer.data('validator-method') || inputer.data('va-method') || 'length',
					Resulter: inputer.data('validator-resulter') || inputer.data('va-show') || '',
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
				
				if (typeof v_data.ResulterObj === 'object') {
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
				}
				
				if (typeof v_data.msgResulterObj === 'object') {
					var msgBackup = v_data.msgResulterObj.text();
					
					setMSGWrong = function() {
						v_data.msgResulterObj.text(v_data.WrongMSG.replace('{max}', v_data.Max).replace('{min}', v_data.Min));
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
				
				inputer.validate = function(validated) {
					switch(validated) {
						case status.GET:
							var statusCode = inputer['validated'];
							
							if (typeof statusCode === 'undefined') {
								return inputer.validate(status.VERIFY);
							}
							
							return statusCode;
							break;
							
						case status.VERIFY:
							var statusCode = inputer.validate();
							
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
							switch(validated) {
								case status.WAIT:
									setCSSWorking();
									setting.events.Wait(inputer);
									break;
									
								case status.PASSED:
									dismissCSSWrong();
									dismissMSGWrong();
									dismissCSSWorking();
									setting.events.Passed(inputer);
									break;
									
								case status.INVALID:
									setCSSWrong();
									setMSGWrong();
									dismissCSSWorking();
									setting.events.Errored(inputer);
									break;
							}
							
							inputer['validated'] = validated;
							
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
								inputer.validate(status.PASSED);
							} else {
								inputer.validate(status.INVALID);
							}
						}
					);
				};
				
				var v_check = function() {
					if (inputer.validate(status.VERIFY) == status.PASSED) {
						switch(v_hook()) {
							case status.PASSED:
								return inputer.validate(status.PASSED);
								
							case status.INVALID:
								return inputer.validate(status.PASSED);
						}
					}
				};
				
				var v_test = function() {
					if (inputer['validate-tested'] !== true && inputer.validate(status.TEST) == status.PASSED) {
						inputer['validate-tested'] = true;
						return status.WAIT;
					}
					
					if (inputer['validate-tested'] === true) {
						return v_check();
					}
				};
				
				inputer.change(v_check);
				inputer.keyup(v_test);
				inputer.click(v_test);
				
				inputer.validator = v_data;
				
				setting.inputs.push(inputer);
			});
			
			form.submit(function() {
				if (checkAll()) {
					self.onSubmit(true);
					
					return true;
				} else {
					self.onSubmit(false);
				}
				
				return false;
			});
			
			inited = true;
			
			return true;
		};
		
		var convertPreg = function(string) {
			return string.replace(/\{/g, '').replace(/\}/g, '').replace(/\\x/g, '\\u').match('/(.*)/')[1];
		}
		
		var log = function(message) {
			if (typeof console != undefined) {
				console.log('[Validator] validator stopped due to a problem: ' + message + '.');
			}
		};
		
		var checkAll = function() {
			var result = true;
			
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
		}
		
		var verify = function(val, max, min, type, method) {
			if ((type && typeof setting.formats[type] !== 'undefined') && !val.match(setting.formats[type])) {
				return false;
			}
			
			if (typeof setting.methods[method] === 'function') {
				if (!setting.methods[method](val, max, min)) {
					return false;
				}
				
				return true;
			} else {
				log('Method ' + method + ' not found.');
			}
		};
		
		init();
	};
	
	$.fn.validator = function(options, config) {
		var cfg = {};
		
		if (typeof config !== 'undefined') {
			cfg = {
				topOffset: typeof config.topOffset !== 'undefined' ? config.topOffset : 50
			};
		} else {
			cfg = {
				topOffset: 50
			};
		}
		
		var v = new Validator(this, options);
		
		v.onSubmit = function(result) {
			if (!result && typeof v.data.lastErrPos.top !== 'undefined') {
				$('html, body').animate({ scrollTop: v.data.lastErrPos.top - cfg.topOffset }, 1000);
			}
		};
		
		return v;
	};
})(jQuery);