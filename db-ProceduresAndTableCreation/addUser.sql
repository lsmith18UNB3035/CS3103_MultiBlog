DROP PROCEDURE IF EXISTS addUser;
DELIMITER //
CREATE PROCEDURE addUser
(
    usernameIn varchar(25)
)
BEGIN
    INSERT INTO users (username) 
    VALUES(usernameIn);
END //
DELIMITER ;
