DROP PROCEDURE IF EXISTS getBlogsByUser;
DELIMITER //
CREATE PROCEDURE getBlogsByUser
(
    idIn    INT
)
BEGIN
    SELECT * FROM blogs WHERE userId=idIn;
END //
DELIMITER ;
