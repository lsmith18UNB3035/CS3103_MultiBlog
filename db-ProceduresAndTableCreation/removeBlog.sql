DROP PROCEDURE IF EXISTS removeBlog;
DELIMITER //
CREATE PROCEDURE removeBlog
(
    idIn INT
)
BEGIN
    DELETE FROM blogs WHERE blogId=idIn;

END //
DELIMITER ;
