jQuery Validator Plugin
=================================================================

jQuery Validator 是一个用来验证用户提交信息合法性的小插件。你可以用它来方便的验证用户的输入，并给出提示以便用户进行修正。

比如，你想要在你的网站上添加一个用户留言，那么你或许会想要写下这样一个表单：

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
	
当然，只要网站工作正常，这个表单就能正常工作。你或许还可以修改你的程序以便提示用户什么地方需要重新输入。

但，这样的话，用户每输入完成一次就必须请求服务器来尝试效验，这样势必会增加服务器的负担。所以最佳的方式，是通过一套与服务器上限定条件相同的验证式来在用户的客户端对输入进行验证。

jQuery Validator就是为此目的开发的轻量级客户端输入验证器。在这个小程序中，你可以：

* 直接导入部分PHP正则表达式
* 自定义验证器以便实现自己的复杂验证函数

初始化
-----------------------------------------------------------------

还记的上面那个表单么？

使用jQuery Validator对其进行验证非常简单。

1. 载入jQuery Validator

载入jQuery Validator的方式和您载入其他jQuery插件的方式没有区别，您可以使用诸如下列方式来载入jquery.validator.min.js文件：

	$.getScript("{% $RootURL %}/assets/libs/jquery.validator.min.js", function() {
		// Do some init
	});

2. 初始化参数。

当jQuery Validator被载入之后，您就可以对它进行初始化了。根据上面的例子，我们先来绑定ID为message的form。这可以通过jQuery的$函数来实现，当然，别忘了初始化参数：

	$.getScript("{% $RootURL %}/assets/libs/jquery.validator.min.js", function() {
		$("#setting-form").validator({
			Format: $("#setting-validator-expressions").data('expressions')
		});
	});
	
这样我们就完成了jQuery Validator的初始化。很简单不是么？需要注意的是，我们这里使用了$("#setting-validator-expressions").data('expressions')来导入正则表达式对象到Format配置中。因为在jQuery Validator中，默认不包含任何表达式。因为我们的表达式往往与您的Web应用程序不同，而通过不同的方式来进行验证最终会因为冲突而导致用户的疑惑。

因此，您需要自行从您的Web应用程序中导出这些正则表达式。当然，您也可以直接使用下面初始化例子中的表达式来进行测试：

	$.getScript("{% $RootURL %}/assets/libs/jquery.validator.min.js", function() {
		$("#setting-form").validator({
			Format:  {"email":"\/^[a-zA-Z0-9\\_\\-\\.]+\\@[a-zA-Z0-9\\_\\-\\.]+\\.[a-zA-Z0-9\\_\\-\\.]+$\/u","password":"\/^[a-fA-F0-9]+$\/i","username":"\/^[A-Za-z0-9\\x{007f}-\\x{ffe5}\\.\\_\\-]+$\/u","standard":"\/^[A-Za-z0-9\\x{007f}-\\x{ffe5}\\.\\_\\@\\-\\:\\#\\,\\s]+$\/u","filename":"\/^[A-Za-z0-9\\s\\(\\)\\.\\-\\,\\_\\x{007f}-\\x{ffe5}]+$\/u","url":"\/^[a-zA-Z0-9]+\\:\\\/\\\/[a-zA-Z0-9\\\u0026\\;\\.\\#\\\/\\?\\-\\=\\_\\+\\:\\%\\,]+$\/u","urlelement":"\/[a-zA-Z0-9\\.\\\/\\?\\-\\=\\\u0026\\_\\+\\:\\%\\,]+\/u","number":"\/^[0-9]+$\/u","float":"\/^[0-9]{0,}[\\.]{0,1}[0-9]{0,}$\/u"}
		});
	});

初始化之后，jQuery Validator会自动绑定表单中所有的Input、Textarea、Select控件，并且自动对其中的内容进行效验。但是要让效验生效，我们还需要配置下表单。

通常的Web表单控件由Input、Textarea、Select等组成，比如用来让用户填写姓名的 <input name="Name" /> 输入组件。需要注意的是，这个组件是没有任何状态的，这意味着它允许接收任何输入。要让jQuery Validator对这个控件进行效验，我们需要为它增加一些属性。

我们已经知道这个输入组件将被用来输入用户的用户名，为了方便，我们就直接按照上面例子中的正则来进行配置：

	<input name="Name" data-va-max="10" data-va-max="1" data-va-type="username" />
	
现在，我们就得到了必须输入至少1个字符，最大只能输入10个字符的文本输入框，并且输入的将使用名为username的正则表达式进行效验。

下面的列表中是所有可用于配置的参数。

	data-validator-maxlength(缩略形式:data-va-max): 限制最大输入长度，相当于maxlength，单不会强制限定长度，只是在超过这个长度时，禁止表单提交；
	data-validator-minlength(缩略形式:data-va-min): 限制最小输入长度；
	data-validator-type(缩略形式:data-va-type): 数据类型，相当于正则表达式的Key名称；
	
	data-validator-resulter(缩略形式:data-va-show): 配置当发生了错误或者需要强调显示的时候，使用哪个选择器；
	data-validator-wrong(缩略形式:data-va-error): 配置当发生了错误输入的时候，向上面的选择器添加的CSS类；
	data-validator-working(缩略形式:data-va-working): 配置当效验器正在工作的时候，向上面的选择器添加的CSS类；
	
	data-validator-messager(缩略形式:data-va-msg): 配置当发生了错误输入的时候，用于提示用户输入的语句；
	data-validator-message(缩略形式:data-va-msgr): 配置当发生了错误输入的时候，用户显示上列语句的选择器；
	
// DOTO: Finish this document when get time.