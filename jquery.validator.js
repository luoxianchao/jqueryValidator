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
		
		var setting = {
			formats: null,
			inputs: [],
			binds: []
		};
		
		var status = {
			WAIT: 1, PASSED: 2, INVALID: 3, VERIFY: 4, GET: 5
		};
		
		self.data = {
			lastErrPos: {},
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
			
			if (typeof options.Bind === 'object') {
				for (var f in options.Bind) {
					if (typeof options.Bind[f] == 'function') {
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
					Max: inputer.data('validator-maxlength') || inputer.data('va-max'),
					Min: inputer.data('validator-minlength') || inputer.data('va-min'),
					Type: inputer.data('validator-type') || inputer.data('va-type'),
					Resulter: inputer.data('validator-resulter') || inputer.data('va-show'),
					WrongCSS: inputer.data('validator-wrong') || inputer.data('va-error'),
					WorkingCSS: inputer.data('validator-working') || inputer.data('va-working'),
					msgResulter: inputer.data('validator-messager') || inputer.data('va-msgr'),
					WrongMSG: inputer.data('validator-message') || inputer.data('va-msg'),
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
						v_data.msgResulterObj.text(v_data.WrongMSG);
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
				
				v_data.validate = function(validated) {
					switch(validated) {
						case status.GET:
							var statusCode = inputer.data('validated');
							
							if (typeof statusCode === 'undefined') {
								return v_data.validate(status.VERIFY);
							}
							
							return statusCode;
							break;
							
						case status.VERIFY:
							var statusCode = v_data.validate();
							
							if (checkStr(inputer.val(), v_data.Max, v_data.Min, v_data.Type)) {
								return v_data.validate(status.PASSED);
							} else {
								return v_data.validate(status.INVALID);
							}
							break;
							
						default:
							switch(validated) {
								case status.WAIT:
									setCSSWorking();
									break;
									
								case status.PASSED:
									dismissCSSWrong();
									dismissMSGWrong();
									dismissCSSWorking();
									break;
									
								case status.INVALID:
									setCSSWrong();
									setMSGWrong();
									dismissCSSWorking();
									break;
							}
							
							inputer.data('validated', validated);
							
							return validated;
							break;
					}
				};
				
				var v_hook = function() {
					v_data.validate(status.WAIT);
					
					return v_data.hook(
						inputer.val(),
						function(successed) {
							if (successed) {
								v_data.validate(status.PASSED);
							} else {
								v_data.validate(status.INVALID);
							}
						}
					);
				};
				
				var v_event = function() {
					if (v_data.validate(status.VERIFY) == status.PASSED) {
						switch(v_hook()) {
							case status.PASSED:
								return v_data.validate(status.PASSED);
								
							case status.INVALID:
								return v_data.validate(status.PASSED);
						}
					}
				};
				
				inputer.change(v_event);
				inputer.keyup(v_event);
				inputer.data('validator', v_data);
				
				setting.inputs.push(inputer);
			});
			
			form.submit(function() {
				return checkAll();
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
				if (setting.inputs[p].data('validator').validate(status.GET) != status.PASSED) {
					result = false;
					alert(setting.inputs[p].val() + ' : '+ setting.inputs[p].data('validator').validate(status.GET));
				}
			}
			
			if (!result) {
				self.data.lastErrPos = setting.inputs[p].position();
			} else {
				self.data.lastErrPos = {};
			}
			
			return result;
		}
		
		var checkStr = function(val, max, min, type) {
			if ((max && val.length > max) || (min && val.length < min) || ((type && typeof setting.formats[type] !== 'undefined') && !val.match(setting.formats[type]))) {
				return false;
			}
			
			return true;
		};
		
		init();
	};
	
	$.fn.validator = function(options) {
		var v = new Validator(this, options);
		
		return v;
	};
})(jQuery);