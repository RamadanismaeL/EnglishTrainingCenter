/*
*@auhtor Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class TrainerMap : IEntityTypeConfiguration<TrainerModel>
    {
        public void Configure(EntityTypeBuilder<TrainerModel> builder)
        {
            builder.HasIndex(t => t.FullName);
            builder.HasIndex(t => t.Status);

            builder.Property(t => t.DateRegister)
                .HasColumnName("DateRegister")
                .HasColumnType("datetime")
                .HasDefaultValueSql("current_timestamp")
                .IsRequired();

            builder.Property(t => t.DateUpdate)
                .HasColumnName("DateUpdate")
                .HasColumnType("datetime");

            builder.Property(t => t.SubsidyMT)
                .HasPrecision(10,2);

            builder.Property(t => t.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasMany(t => t.Payments)
                .WithOne(p => p.Trainer)
                .HasForeignKey(p => p.TrainerId);
        }
    }
}