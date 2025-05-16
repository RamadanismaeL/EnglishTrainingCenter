/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using server.src.Data.Maps;
using server.src.Models;

namespace server.src.Data
{
    public class ServerDbContext : IdentityDbContext
    {
        public ServerDbContext(DbContextOptions<ServerDbContext> options) : base(options)
        {}

        // Trainer
        public required DbSet<TrainerModel> Trainers { get; set; }
        public required DbSet<PasswordResetCodeModel> PasswordResetCode { get; set; }


        //Student
        public required DbSet<StudentDataModel> StudentData { get; set; }
        public required DbSet<StudentCourseInfoModel> StudentCourseInfo { get; set; }
        public required DbSet<StudentEnrollmentFormModel> StudentEnrollmentForm { get; set; }
        public required DbSet<StudentPaymentModel> StudentPayments { get; set; }
 

        // Settings
        public required DbSet<SettingsAcademicYearModel> SettingsAcademicYear { get; set; }
        public required DbSet<SettingsAmountMtModel> SettingsAmountMt { get; set; }
        public required DbSet<SettingsMonthlyTuitionModel> SettingsMonthlyTuition { get; set; }
        public required DbSet<SettingsWeeklyScheduleModel> SettingsWeeklySchedule { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Trainer
            builder.ApplyConfiguration(new TrainerMap());
            builder.ApplyConfiguration(new PasswordResetCodeMap());


            //Student
            builder.ApplyConfiguration(new StudentDataMap());
            builder.ApplyConfiguration(new StudentCourseInfoMap());
            builder.ApplyConfiguration(new StudentEnrollmentFormMap());
            builder.ApplyConfiguration(new StudentPaymentMap());
            

            // Settings
            builder.ApplyConfiguration(new SettingsAcademicYearMap());
            builder.ApplyConfiguration(new SettingsAmountMtMap());
            builder.ApplyConfiguration(new SettingsMonthlyTuitionMap());
            builder.ApplyConfiguration(new SettingsWeeklyScheduleMap());
            

            base.OnModelCreating(builder);
        }
    }
}