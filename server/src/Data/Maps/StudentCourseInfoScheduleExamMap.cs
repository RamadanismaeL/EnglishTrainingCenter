/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentCourseInfoScheduleExamMap : IEntityTypeConfiguration<StudentCourseInfoScheduleExamModel>
    {
        public void Configure(EntityTypeBuilder<StudentCourseInfoScheduleExamModel> builder)
        {
            builder.ToTable("tbStudentCourseInfoScheduleExam");

            builder.Property(s => s.CourseInfoId)
                .HasColumnName("CourseInfoId")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasKey(s => s.CourseInfoId);

            builder.HasOne(s => s.CourseInfoData)
                .WithOne(s => s.CourseInfoScheduleExamData)
                .HasPrincipalKey<StudentCourseInfoModel>(s => s.Id)
                .HasForeignKey<StudentCourseInfoScheduleExamModel>(s => s.CourseInfoId);


            builder.Property(s => s.Status)
                .HasColumnName("Status")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.IsScheduled)
                .HasColumnName("IsScheduled")
                .HasColumnType("bit")
                .IsRequired();

            builder.Property(s => s.ScheduledDate)
                .HasColumnName("ScheduledDate")
                .HasColumnType("datetime");   
        }
    }
}