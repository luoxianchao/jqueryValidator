jQuery Validator Plugin
=================================================================

jQuery Validator ��һ��������֤�û��ύ��Ϣ�Ϸ��Ե�С�����������������������֤�û������룬��������ʾ�Ա��û�����������

���磬����Ҫ�������վ�����һ���û����ԣ���ô��������Ҫд������һ������

	<!doctype html>
	<html>
		<head><title>My Tittle Form</title></head>
		
		<body>
			<form id="message" method="post" action="/message.php">
				<fieldset>
					<div id="field-name">
						<input name="Name" />
					</div>
					
					<div id="field-message">
						<input name="Message" />
					</div>
					
					<div id="field-submit">
						<button type="submit">Submit</button>
					</div>
					
				</fieldset>
			</form>
		</body>
	</html>
	
��Ȼ��ֻҪ��վ���������������������������������������޸���ĳ����Ա���ʾ�û�ʲô�ط���Ҫ�������롣

���������Ļ����û�ÿ�������һ�ξͱ������������������Ч�飬�����Ʊػ����ӷ������ĸ�����������ѵķ�ʽ����ͨ��һ������������޶�������ͬ����֤ʽ�����û��Ŀͻ��˶����������֤��

jQuery Validator����Ϊ��Ŀ�Ŀ������������ͻ���������֤���������С�����У�����ԣ�

* ֱ�ӵ��벿��PHP������ʽ
* �Զ�����֤���Ա�ʵ���Լ��ĸ�����֤����

��ʼ��
-----------------------------------------------------------------

���ǵ������Ǹ���ô��

ʹ��jQuery Validator���������֤�ǳ��򵥡�

1. ����jQuery Validator

����jQuery Validator�ķ�ʽ������������jQuery����ķ�ʽû������������ʹ���������з�ʽ������jquery.validator.min.js�ļ���

	$.getScript("{% $RootURL %}/assets/libs/jquery.validator.min.js", function() {
		// Do some init
	});

2. ��ʼ��������

��jQuery Validator������֮�����Ϳ��Զ������г�ʼ���ˡ�������������ӣ�����������IDΪmessage��form�������ͨ��jQuery��$������ʵ�֣���Ȼ�������˳�ʼ��������

	$.getScript("{% $RootURL %}/assets/libs/jquery.validator.min.js", function() {
		$("#setting-form").validator({
			Format: $("#setting-validator-expressions").data('expressions')
		});
	});
	
�������Ǿ������jQuery Validator�ĳ�ʼ�����ܼ򵥲���ô����Ҫע����ǣ���������ʹ����$("#setting-validator-expressions").data('expressions')������������ʽ����Format�����С���Ϊ��jQuery Validator�У�Ĭ�ϲ������κα��ʽ����Ϊ���ǵı��ʽ����������WebӦ�ó���ͬ����ͨ����ͬ�ķ�ʽ��������֤���ջ���Ϊ��ͻ�������û����ɻ�

��ˣ�����Ҫ���д�����WebӦ�ó����е�����Щ������ʽ����Ȼ����Ҳ����ֱ��ʹ�������ʼ�������еı��ʽ�����в��ԣ�

	$.getScript("{% $RootURL %}/assets/libs/jquery.validator.min.js", function() {
		$("#setting-form").validator({
			Format:  {"email":"\/^[a-zA-Z0-9\\_\\-\\.]+\\@[a-zA-Z0-9\\_\\-\\.]+\\.[a-zA-Z0-9\\_\\-\\.]+$\/u","password":"\/^[a-fA-F0-9]+$\/i","username":"\/^[A-Za-z0-9\\x{007f}-\\x{ffe5}\\.\\_\\-]+$\/u","standard":"\/^[A-Za-z0-9\\x{007f}-\\x{ffe5}\\.\\_\\@\\-\\:\\#\\,\\s]+$\/u","filename":"\/^[A-Za-z0-9\\s\\(\\)\\.\\-\\,\\_\\x{007f}-\\x{ffe5}]+$\/u","url":"\/^[a-zA-Z0-9]+\\:\\\/\\\/[a-zA-Z0-9\\\u0026\\;\\.\\#\\\/\\?\\-\\=\\_\\+\\:\\%\\,]+$\/u","urlelement":"\/[a-zA-Z0-9\\.\\\/\\?\\-\\=\\\u0026\\_\\+\\:\\%\\,]+\/u","number":"\/^[0-9]+$\/u","float":"\/^[0-9]{0,}[\\.]{0,1}[0-9]{0,}$\/u"}
		});
	});

��ʼ��֮��jQuery Validator���Զ��󶨱������е�Input��Textarea��Select�ؼ��������Զ������е����ݽ���Ч�顣����Ҫ��Ч����Ч�����ǻ���Ҫ�����±���

ͨ����Web���ؼ���Input��Textarea��Select����ɣ������������û���д������ <input name="Name" /> �����������Ҫע����ǣ���������û���κ�״̬�ģ�����ζ������������κ����롣Ҫ��jQuery Validator������ؼ�����Ч�飬������ҪΪ������һЩ���ԡ�

�����Ѿ�֪�������������������������û����û�����Ϊ�˷��㣬���Ǿ�ֱ�Ӱ������������е��������������ã�

	<input name="Name" data-va-max="10" data-va-max="1" data-va-type="username" />
	
���ڣ����Ǿ͵õ��˱�����������1���ַ������ֻ������10���ַ����ı�����򣬲�������Ľ�ʹ����Ϊusername��������ʽ����Ч�顣

������б��������п��������õĲ�����

	data-validator-maxlength(������ʽ:data-va-max): ����������볤�ȣ��൱��maxlength��������ǿ���޶����ȣ�ֻ���ڳ����������ʱ����ֹ���ύ��
	data-validator-minlength(������ʽ:data-va-min): ������С���볤�ȣ�
	data-validator-type(������ʽ:data-va-type): �������ͣ��൱��������ʽ��Key���ƣ�
	
	data-validator-resulter(������ʽ:data-va-show): ���õ������˴��������Ҫǿ����ʾ��ʱ��ʹ���ĸ�ѡ������
	data-validator-wrong(������ʽ:data-va-error): ���õ������˴��������ʱ���������ѡ������ӵ�CSS�ࣻ
	data-validator-working(������ʽ:data-va-working): ���õ�Ч�������ڹ�����ʱ���������ѡ������ӵ�CSS�ࣻ
	
	data-validator-messager(������ʽ:data-va-msg): ���õ������˴��������ʱ��������ʾ�û��������䣻
	data-validator-message(������ʽ:data-va-msgr): ���õ������˴��������ʱ���û���ʾ��������ѡ������
	
// DOTO: Finish this document when get time.