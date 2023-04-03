DROP PROCEDURE IF EXISTS getUserWithUsername;
DELIMITER //
CREATE PROCEDURE getUserWithUsername
(
    usernameIn varchar(25)
)
BEGIN
    select * from users where username = usernameIn;
END //
DELIMITER ;
