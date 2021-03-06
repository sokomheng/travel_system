<?php
class User_model extends CI_Model {

	function __construct()
	{
		parent::__construct();

		//$this->load->model('common_model');
	}
	/* register user on register page data: registerForm submit */
	function signupUser () {
	    $name = $_POST['name'];
	    $email = $_POST['email'];
	    $password = $_POST['password'];
        /*  check user name or email already exist in database      */
	    $str_sql = "SELECT * FROM ts_user WHERE ts_name = ? or ts_email = ?";
	    $params = array('ts_name' => $name, 'ta_email' => $email);
	    $result = $this->db->query($str_sql, $params);
	    if ($result->num_rows)
	        $data['result'] = 'exist';
	    else {
	        $salt =  random_string('alnum', 9);
	        $password = md5($password.$salt);
	        
	        $str_sql = "INSERT INTO ts_user (ts_name, ts_email, ts_password, ts_salt, ts_created_time, ts_updated_time)
	                        VALUES(?,?,?,?,now(), now())";
	        $params = array(
                        'name' => $name,
                        'email' => $email,
                        'password' => $password,
	                    'salt' => $salt
	                    );
	       $this->db->query($str_sql, $params);
	       $data['result'] = 'success';
	    }
	    return $data;
	}
	/* login submit on login page data: loginForm submit  */
	function login () {
	    $email = $_POST['email'];
	    $password = md5($_POST['password'].$this->GetSalt($email));
	    $str_sql = "SELECT * FROM ts_user WHERE (ts_name = ? or ts_email = ?) AND ts_password =? LIMIT 1";
	    $params = array(
	    		 	 'name' => $email,
	                 'email' => $email,
	                 'password' => $password
	              );
	    $result = $this->db->query($str_sql, $params);
	    if ($result->num_rows > 0) {
	        foreach ($result->result_array() as $key => $res) {
	            $this->session->set_userdata(
	                            array(
                                    'USER_ID' => $res['user_id'],
                                    'USER_NAME' => $res['ts_name'],
                                    'IS_FRONT_LOGIN' => TRUE,
	                            )
	            );
	        }
	        return true;
	    }
	    return false;
	    
	}
	/* get salt with by email address  */
	function GetSalt ($email) {
	    $str_sql = "SELECT ts_salt FROM ts_user WHERE ts_name = ? or ts_email = ? LIMIT 1";
	    $params = array('name' => $email, 'email' => $email);
	    $result = $this->db->query($str_sql, $params)->result();
	    if ($result != null)
	        return $result[0]->ts_salt;
	    else return -1;
	    
	}
	/* logout  */
	function logout () {
	    $this->session->unset_userdata('USER_ID');
	    $this->session->unset_userdata('USER_EMAIL');
	    $this->session->unset_userdata('IS_FRONT_LOGIN');
	}
	/* get user list */
	function GetUserList ($id = null) {
	    $str_sql = "SELECT * FROM ts_user";
	    if ($id != null)
	        $str_sql .= " WHERE user_id = $id";
	    $result = $this->db->query($str_sql)->result();
	    if ($result != null)
	        return $result;
	    else return -1;
	}
	/* admin login on admin side  */
	function checkAdminLogin () {
	    $email = $_POST['email'];
	    $password = md5($_POST['password'].$this->GetSalt($email));
	    $str_sql = "SELECT * FROM ts_user WHERE (ts_name = ? or ts_email = ?) AND ts_password =? AND ts_is_admin = 'Y' LIMIT 1";
	    $params = array(
	                 'name' => $email,
	                 'email' => $email,
	                 'password' => $password
	              );
	    $result = $this->db->query($str_sql, $params);
	    if ($result->num_rows > 0) {
	        foreach ($result->result_array() as $key => $res) {
	            $this->session->set_userdata(
                            array(
                                'ADMIN_ID' => $res['user_id'],
                                'ADMIN_EMAIL' => $res['ts_email'],
                                'IS_ADMIN_LOGIN' => TRUE
                            )
	            );
	        }
	        return true;
	    }
	    return false;
	    
	}
	function removeUserByIds () {
	    $userIds = $_POST['strUserIds'];
	    $str_sql = "DELETE FROM ts_user WHERE user_id IN ($userIds)";
	    $result = $this->db->query($str_sql);
	    if ($result)
	        $data['result'] = "success";
	    else $data['result'] = "failed";
	    return $data;
	}
	/* admin logout function */
	function adminLogout () {
	    $this->session->unset_userdata('ADMIN_ID');
	    $this->session->unset_userdata('ADMIN_EMAIL');
	    $this->session->unset_userdata('IS_ADMIN_LOGIN');
	}
	/* add user on admin side */
	function adminSaveUser() {
	    $data = array();
        
        $userName = $_POST['userName'];
        $userEmail = $_POST['userEmail'];
        $userPassword = $_POST['userPassword'];
        if (isset($_POST['userType']) && $_POST['userType'] != "") {
            $userType = "Y";
        } else
            $userType = "N";
        
        if (isset($_POST['userId'])) {
            $userId = $_POST['userId'];
           $str_sql = "UPDATE ts_user
                           SET ts_name = ?
                             , ts_email = ?
	                         , ts_is_admin = ?
                             , ts_updated_time = now()";
    	    if ($userPassword != "") {
    	        $salt =  random_string('alnum', 9);
    	        $password = md5($userPassword.$salt);
    	        $str_sql .=" , ts_password = '".$password."'
    	                     , ts_salt = '".$salt."'";
    	    }
    	    $str_sql .=" WHERE user_id = ?";
    	    $params = array(
    	                    'ts_name' => $userName,
    	                    'ts_email' => $userEmail,
    	                    'ts_is_admin' => $userType,
    	                    'user_id' => $userId
    	               );
    	    $this->db->query($str_sql, $params);
    	    $data['result'] = 'success';
        } else {
            /*  check user name or email already exist in database      */
    	    $str_sql = "SELECT * FROM ts_user WHERE ts_name = ? or ts_email = ?";
    	    $params = array('ts_name' => $userName, 'ta_email' => $userEmail);
    	    $result = $this->db->query($str_sql, $params);
    	    if ($result->num_rows)
    	        $data['result'] = 'exist';
    	    else {
    	        $salt =  random_string('alnum', 9);
    	        $password = md5($userPassword.$salt);
    	        
    	        $str_sql = "INSERT INTO ts_user (ts_name, ts_email, ts_password, ts_salt, ts_is_admin, ts_created_time, ts_updated_time)
    	                        VALUES(?,?,?,?,?,now(), now())";
    	        $params = array(
                            'name' => $userName,
                            'email' => $userEmail,
                            'password' => $password,
    	                    'salt' => $salt,
    	                    'is_admin' => $userType
    	                    );
    	       $this->db->query($str_sql, $params);
    	       $data['result'] = 'success';
    	    }
        }
        return $data;
	}
}

/* End of file user_model.php */
/* Location: ./application/models/admin/user_model.php */