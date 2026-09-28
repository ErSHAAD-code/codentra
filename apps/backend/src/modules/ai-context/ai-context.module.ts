import { Module } from '@nestjs/common';

import { LanguageDetectorModule } from '@/modules/language-detector/language-detector.module';

import { ContextBuilderService } from './context-builder.service';

@Module({
  imports: [LanguageDetectorModule],
  providers: [ContextBuilderService],
  exports: [ContextBuilderService],
})
export class AIContextModule {}
