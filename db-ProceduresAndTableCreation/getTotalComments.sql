DROP PROCEDURE IF EXISTS getTotalComments;
DELIMITER //
CREATE PROCEDURE getTotalComments()
BEGIN
    select count(*) from comments;

END //
DELIMITER ;