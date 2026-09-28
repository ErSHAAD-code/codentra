import { Module } from '@nestjs/common';

import { ContextBuilderService } from './context-builder.service';

import { LanguageDetectorModule } from '@/modules/language-detector/language-detector.module';


@Module({
  imports: [LanguageDetectorModule],
  providers: [ContextBuilderService],
  exports: [ContextBuilderService],
})
export class AIContextModule {}
