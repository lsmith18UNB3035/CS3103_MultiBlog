DROP PROCEDURE IF EXISTS getUsernameByUserId;
DELIMITER //
CREATE PROCEDURE getUsernameByUserId(userIdIn INT)
BEGIN
    SELECT username FROM users where userId = userIdIn;
END //
DELIMITER ;
