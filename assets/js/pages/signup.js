$(document).ready(function () {
	$('form#signupForm').validate({
        errorElement: 'em', //default input error message container
        errorClass: 'invalid', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",
        rules: {
            name: {
                required: true,
                maxlength: 35
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 5,
                maxlength: 35
            },
            confirmPassword: {
                required: true,
                minlength: 5,
                maxlength: 35,
                equalTo: "#password"
            }
        },

        messages: {
            Name: {
                required: "Name is required"
            },
            email: {
                required: "Email is required"
            },
            password: {
                required: "Password is required"
            },
            confirmPassword : {
                required: "Confirm Password is required",
                equalTo: "Password not matched"
            }
           
        },


        highlight: function (element) { // hightlight error inputs
            $(element)
                .closest('label.input').addClass('state-error'); // set error class to the control group
        },

        success: function (label) {
            label.closest('label.input').removeClass('state-error');
            label.remove();
        },

        errorPlacement: function (error, element) {
            error.appendTo(element.closest('section'));
        },

//        submitHandler: function (form) {
//        	
//        }
    });
	
	$("button#signup").click(function () {
        var tempUrl = Base_Url + '/user/signupUser';
		if ($('form#signupForm').valid()) {
			$('form#signupForm').attr("method", "post");
			$('form#signupForm').attr("action", tempUrl);
			$('form#signupForm').ajaxForm({
				success: function(data) {
					if (data.result == "success") {
						alert("Registered Successfully.Please log in.");
						
					} else if (data.result == "exist") {
						alert("Name or Email address already exist!");
						return;
					}
				}
			}).submit();
		}
	});

});